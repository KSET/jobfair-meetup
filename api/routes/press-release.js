import {
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  RoleNames,
} from "../helpers/permissions";
import PressReleaseService from "../services/press-release-service";

const router = new Router();

router.get("/all", async () => {
  return await PressReleaseService.list();
});

router.get("/release/:id", async ({ params }) => {
  const { id } = params;

  return await PressReleaseService.info(id);
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.put("/", async ({ body }) => {
  const {
    title,
    fileId,
  } = body;

  return await PressReleaseService.create({
    title,
    fileId,
  });
});

authRouter.patch("/:id", async ({ params, body }) => {
  const { id } = params;
  const {
    title,
    fileId,
  } = body;

  return await PressReleaseService.update(
    id,
    {
      title,
      fileId,
    },
  );
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await PressReleaseService.delete(id);
});

export default authRouter;
