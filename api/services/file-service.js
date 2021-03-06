import {
  mkdir as mkdirCb,
} from "fs";
import {
  promisify,
} from "util";
import {
  deleteFileById,
  queryFileCreate,
  queryFileGetByHashAndPath,
  queryFileGetById,
  queryFileGetByIds,
} from "../../db/helpers/file";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  apiFilePath,
  fileDbToEntry,
  localFilePath,
  localFolderPath,
} from "../helpers/file";

const mkdir = promisify(mkdirCb);

export default class FileService {
  static async upload(file, uploaderId) {
    const client = await Client.inTransaction();

    let fileData = null;
    try {
      await mkdir(localFolderPath(), { recursive: true });

      fileData = {
        name: file.name,
        size: file.size,
        hash: file.md5,
        path: localFilePath(file),
        mimeType: file.mimetype,
        uploaderId,
      };

      await file.mv(fileData.path);

      const { id: fileId } = await client.queryOne(queryFileCreate(fileData));

      fileData.id = fileId;
      fileData.url = apiFilePath({ fileId });

      await client.commit();

      return fileData;
    } catch (e) {
      if (fileData && "files_path_uindex" === e.constraint) {
        const file = await Client.queryOneOnce(queryFileGetByHashAndPath(fileData));

        if (file) {
          file.url = apiFilePath({ fileId: file.id });

          return file;
        }
      }

      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static async remove(id) {
    try {
      const client = await Client.inTransaction();

      return await deleteFileById(client, { id });
    } catch (e) {
      return false;
    }
  }

  static async info(id) {
    const file = await Client.queryOneOnce(queryFileGetById({
      id,
    }));

    if (!file) {
      return null;
    }

    return fileDbToEntry(file);
  }

  static async listInfo(...ids) {
    const res = await Client.queryOnce(queryFileGetByIds(...ids.flat())) || [];

    return res.map(fileDbToEntry);
  }

  static async listInfoAsObject(...ids) {
    const list = await this.listInfo(...ids);

    return Object.fromEntries(list.map((item) => [ item.id, keysFromSnakeToCamelCase(item) ]));
  }
}
