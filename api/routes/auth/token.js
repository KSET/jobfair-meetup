import isLive from "../../helpers/health";
import {
  ApiError,
  Router,
  AuthRouter,
} from "../../helpers/route";
import {
  graphQlQuery,
} from "../../helpers/axios";
import {
  refreshTokenMutation,
} from "../../graphql/mutations";
import {
  RoleNames,
} from "../../helpers/permissions";

const router = new Router();

router.post("/refresh", async (req) => {
  const { token, refreshToken } = req.body;

  if (!isLive()) {
    throw new ApiError("application-offline");
  }

  try {
    const data = await graphQlQuery(refreshTokenMutation({ token, refreshToken })) || {};

    return data.refresh_token || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.BASE,
});

authRouter.getRaw("/jwt", (req, res) => {
  if (req.authHeader) {
    res.write(req.authHeader);
  }

  res.end();
});

export default authRouter;
