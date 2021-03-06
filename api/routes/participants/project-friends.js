import * as Sentry from "@sentry/node";
import {
  HttpStatus,
} from "../../helpers/http";
import {
  RoleNames,
} from "../../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../../helpers/route";
import ProjectFriendsService, {
 ProjectFriendsError,
} from "../../services/project-friends-service";

const router = new Router();

router.get("/", async () => {
  return await ProjectFriendsService.list();
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.post("/", async (req) => {
  const { body, files, authUser } = req;
  const { image: imageFile } = files || {};
  const { name, link } = body;

  try {
    return await ProjectFriendsService.create(
      {
        name,
        link,
        image: imageFile,
      },
      authUser.id,
    );
  } catch (e) {
    if (e instanceof ProjectFriendsError) {
      throw new ApiError(e.message);
    }

    Sentry.captureException(e, {
      req,
    });

    throw e;
  }
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  try {
    return await ProjectFriendsService.remove(id);
  } catch (e) {
    if (e instanceof ProjectFriendsError) {
      throw new ApiError(e.message);
    }

    throw e;
  }
});

authRouter.post("/swap", async ({ body }) => {
  const { a, b } = body;

  if (!a || !b) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Both partners must be provided",
    ]);
  }

  try {
    return await ProjectFriendsService.swap(a, b);
  } catch (e) {
    if (e instanceof ProjectFriendsError) {
      throw new ApiError(e.message, e.statusCode);
    }

    throw e;
  }
});

export default authRouter;
