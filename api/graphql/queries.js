import {
  companyData,
  userData,
  basicUserData,
  presentationData,
  workshopData,
  resumeData,
  basicResumeData,
} from "./data";
import {
  createObject,
} from "./helpers";

export const basicUserQuery = () => ({
  query: `{ ${ createObject({
    // eslint-disable-next-line camelcase
    current_user: basicUserData,
  }) } }`,
});

export const currentUserQuery = () => ({
  query: `{ ${ createObject({
    // eslint-disable-next-line camelcase
    current_user: userData,
  }) } }`,
});

export const participantsQuery = () => ({
  query: `{ ${ createObject({
    companies: companyData,
  }) } }`,
});

export const participantEventsQuery = () => ({
  query: `{ ${ createObject({
    companies: companyData,
    presentations: {
      ...presentationData,
      company: {
        id: "required",
      },
    },
    workshops: {
      ...workshopData,
      company: {
        id: "required",
      },
    },
  }) } }`,
});

export const resumesQuery = () => ({
  query: `{ ${ createObject({
    resumes: basicResumeData,
  }) } }`,
});

export const resumeQuery = (id) => ({
  query: `query Resume($id: ID) { ${ createObject({
    "resume(id: $id)": resumeData,
  }) } }`,
  operationName: "Resume",
  variables: {
    id,
  },
});
