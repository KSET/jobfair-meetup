import type {
  AsyncReturnType,
} from "type-fest";
import {
  dotGet,
} from "../../helpers/data";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  industriesQuery,
  participantsQuery,
} from "../graphql/queries";
import {
  graphQlQuery,
  post,
} from "../helpers/axios";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  getSetting,
} from "../helpers/settings";
import type {
  Company as GraphQlCompany,
  Image as GraphQlImage,
  Industry as GraphQlIndustry,
} from "../graphql/types";
import CompanyEventsService from "./company-events-service";
import type {
  Event,
} from "./company-events-service";
import {
  ServiceError,
} from "./error-service";

export interface Company {
  id: string;
  name: string;
  legalName: string;
  brandName: string;
  description: string;
  image: GraphQlImage["large"]["url"];
  thumbnail: string;
  homepageUrl: string;
  address: string;
  cover: GraphQlImage | null;
  industry: GraphQlIndustry;
  images: GraphQlImage | null;
}

interface CompanyWithEvents extends Company {
  events: Event[];
}

const fetchAllCompanies = cachedFetcher<Company[]>(
  "participants",
  60 * 1000,
  async () => {
    const { companies } = await graphQlQuery(participantsQuery()) || {};

    if (!companies) {
      throw new Error("Site offline");
    }

    return companies.map(CompanyService.fixCompany);
  },
);

const fetchAllIndustries = cachedFetcher<GraphQlIndustry[]>(
  "industries",
  3 * 60 * 1000,
  async () => {
    const { industries }: { industries: GraphQlIndustry[] } = await graphQlQuery(industriesQuery()) || {};

    if (!industries) {
      throw new Error("Site offline");
    }

    return industries.sort((a, b) => Number(a.id) - Number(b.id));
  },
);

export class CompanyError extends ServiceError {
}

export default class CompanyService {
  static async fetchListAll(): Promise<Company[]> {
    return await fetchAllCompanies() || [];
  }

  static async fetchIndustries(): Promise<GraphQlIndustry[]> {
    return await fetchAllIndustries() || [];
  }

  static async fetchInfo(id: number): Promise<CompanyWithEvents> {
    const { companies, ...rawEvents }: AsyncReturnType<typeof CompanyEventsService.listAll> | { companies: never[] } = await CompanyEventsService.listAll() || { companies: [] };

    const company = companies.find(({ id: i }) => String(i) === String(id));

    if (!company) {
      throw new CompanyError("Poduzeće nije pronađeno");
    }

    const newType = (key) => {
      switch (key) {
        case "presentations":
          return "talk";
        case "workshops":
          return "workshop";
        default:
          return key.replace(/s$/, "");
      }
    };

    const events =
      Object
        .entries(rawEvents)
        .flatMap(
          ([ type, events ]) =>
            events.map(
              (event) =>
                Object.assign(
                  event,
                  {
                    type: newType(type),
                    title: event.title || event.name,
                    topic: event.topic || "Workshop",
                  },
                ),
            ),
        )
        .filter(({ company, companies }) => {
          if (String(company.id) === String(id)) {
            return true;
          }

          if (!companies) {
            return false;
          }

          return companies.find(({ info }) => String(info.id) === String(id));
        })
    ;

    return { ...company, events };
  }

  static async fetchInfoFromVat(vat: string): Promise<Company> {
    const graphQlUrl = await getSetting(
      "GraphQL Endpoint",
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
    );

    const { origin: baseUrl } = new URL(graphQlUrl);

    const { data: company } =
      await post(
        `${ baseUrl }/api/v1/companies/info`,
        {
          vat,
        },
      ) || {}
    ;

    if (!company) {
      throw new CompanyError("VAT broj nije pronađen");
    }

    return this.fixCompany(company);
  }

  static fixCompany(company: GraphQlCompany): Company {
    const {
      name,
      brandName,
      shortDescription: description,
      logo,
      ...rest
    } = keysFromSnakeToCamelCase(company);

    return ({
      name: brandName || name,
      legalName: name,
      brandName,
      description,
      image: dotGet(logo, "large.url"),
      thumbnail: dotGet(logo, "small.url"),
      images: logo,
      ...rest,
    });
  }
}
