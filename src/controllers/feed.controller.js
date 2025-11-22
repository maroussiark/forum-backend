import FeedService from "../services/feed.service.js";
import { success } from "../utils/apiResponse.js";

class FeedController {
  async list(req, res) {
      const data = await FeedService.getFeed({
        cursor: req.query.cursor || null,
        limit: req.query.limit || 10,
        categoryId: req.query.categoryId || null,
        tagId: req.query.tagId || null,
        sort: req.query.sort || "recent"
      });

      return success(res, data);
  }
}

export default new FeedController();
