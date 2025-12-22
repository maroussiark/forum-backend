# Combined files for sharing in chat

This file contains the selected repository files concatenated with headers for easy copy/paste into chat.

---

## File: prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}


/// ===============================
/// USER, ROLES, PERMISSIONS
/// ===============================

model User {
  id                 String              @id @default(uuid())
  email              String              @unique
  password          String
  roleId            String
  createdAt         DateTime             @default(now())
  updatedAt         DateTime      @updatedAt
  deletedAt         DateTime?


  role              Role                 @relation(fields: [roleId], references: [id])
  profile           UserProfile?

  posts             Post[]
  comments          Comment[]
  reactions         Reaction[]
  messages          Message[]
  conversationMembers ConversationMember[]
  refreshTokens     RefreshToken[]

  notifications     Notification[]       @relation("UserNotifications")
  actorNotifications Notification[]      @relation("ActorNotifications")
}


model Role {
  id              String                @id @default(uuid())
  name            String                @unique
  description     String?

  users           User[]
  rolePermissions RolePermission[]
}

model Permission {
  id          String             @id @default(uuid())
  name        String             @unique
  description String?

  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String

  role         Role        @relation(fields: [roleId], references: [id])
  permission   Permission  @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
}


/// ===============================
/// USER PROFILE
/// ===============================

model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  fullName    String?
  bio         String?
  avatarUrl   String?
  phone       String?
  socialLinks Json?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}


/// ===============================
/// POSTS / CATEGORIES / ATTACHMENTS
/// ===============================

model Post {
  id          String        @id @default(uuid())
  userId      String
  title       String
  content     String?
  categoryId  String?
  deleted     Boolean       @default(false)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user        User          @relation(fields: [userId], references: [id])
  category    Category?     @relation(fields: [categoryId], references: [id])

  attachments Attachment[]
  comments    Comment[]
  reactions   Reaction[]
}

model Category {
  id          String   @id @default(uuid())
  name        String
  description String?

  posts       Post[]
}

model Attachment {
  id         String   @id @default(uuid())
  postId     String
  fileName   String
  fileType   String
  fileSize   Int
  fileUrl    String
  uploadedAt DateTime @default(now())

  post       Post     @relation(fields: [postId], references: [id])
}


/// ===============================
/// COMMENTS (avec replies)
/// ===============================

model Comment {
  id         String    @id @default(uuid())
  postId     String
  userId     String
  parentId   String?
  content    String
  deleted    Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  post       Post      @relation(fields: [postId], references: [id])
  user       User      @relation(fields: [userId], references: [id])

  parent     Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies    Comment[] @relation("CommentReplies")

  reactions  Reaction[]
}


/// ===============================
/// REACTIONS (Post OR Comment, XOR unique)
/// ===============================

model Reaction {
  id           String    @id @default(uuid())
  userId       String
  postId       String?
  commentId    String?
  reactionType String
  createdAt    DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  post     Post?    @relation(fields: [postId], references: [id])
  comment  Comment? @relation(fields: [commentId], references: [id])

  @@unique([userId, postId])
  @@unique([userId, commentId])
}



/// ===============================
/// CONVERSATIONS & MESSAGES
/// ===============================

model Conversation {
  id         String               @id @default(uuid())
  createdAt  DateTime             @default(now())

  messages   Message[]
  members    ConversationMember[]
}

model ConversationMember {
  conversationId String
  userId         String

  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])

  @@id([conversationId, userId])
}

model Message {
  id             String        @id @default(cuid())
  conversationId  String
  senderId        String
  content         String?
  attachmentUrl   String?
  createdAt       DateTime @default(now())
  readAt          DateTime?

  conversation    Conversation @relation(fields: [conversationId], references: [id])
  sender          User         @relation(fields: [senderId], references: [id])
}



/// ===============================
/// NOTIFICATIONS
/// ===============================

model Notification {
  id            String           @id @default(uuid())
  userId        String
  actorId       String?
  type          NotificationType
  title         String
  message       String?
  entityId      String?
  entityType    EntityType?
  isRead        Boolean          @default(false)
  createdAt     DateTime         @default(now())

  user          User             @relation("UserNotifications", fields: [userId], references: [id])
  actor         User?            @relation("ActorNotifications", fields: [actorId], references: [id])
}

enum NotificationType {
  POST_CREATED
  POST_COMMENTED
  POST_REACTED
  
  COMMENT_REACTED
  COMMENT_REPLIED

  MESSAGE_RECEIVED
  CONVERSATION_JOINED

  PROFILE_UPDATED
  SYSTEM
}

enum EntityType {
  POST
  COMMENT
  MESSAGE
  CONVERSATION
  PROFILE
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}

```

---

## File: src/middlewares/auth.js

```javascript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = () => {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return next({ status: 401, message: "Token manquant" });

    const token = header.split(" ")[1];
    if (!token) return next({ status: 401, message: "Token invalide" });

    try {
      // eslint-disable-next-line no-undef
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, roleId }
      next();
    } catch {
      next({ status: 401, message: "Token expiré ou invalide" });
    }
  };
};

```

---

## File: src/middlewares/checkRole.js

```javascript
import { forbidden } from "../shared/errors/ApiError.js";

export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    if (!allowedRoles.includes(req.user.role)) {
      throw forbidden("Accès refusé (rôle insuffisant)");
    }

    next();
  };
}

```

---

## File: src/middlewares/requireRole.js

```javascript
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return next({ status: 401, message: "Utilisateur non authentifié" });

    if (!allowedRoles.includes(req.user.roleId))
      return next({ status: 403, message: "Accès interdit" });

    next();
  };
};

```

---

## File: src/middlewares/requirePermission.js

```javascript
import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export const requirePermission = (permissionCode) => {
   return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const role = req.user.roleId;

    const allowedPermissions = ACL[role] || [];

    if (!allowedPermissions.includes(permissionCode)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
};

```

---

## File: src/middlewares/checkPermission.js

```javascript
import { forbidden } from "../shared/errors/ApiError.js";
import { ACL } from "../shared/constants/acl.js";

export function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) throw forbidden("Authentification requise");

    const role = req.user.role;

    const allowedPermissions = ACL[role] || [];

    if (!allowedPermissions.includes(permission)) {
      throw forbidden("Permission insuffisante");
    }

    next();
  };
}

```

---

## File: src/middlewares/errorHandler.js

```javascript
import logger from "../config/logger.js";
import { error } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl
  });
  next();

  const status = err.status || 500;
  const code = err.code || null;

  return error(res, err.message, status, code);
};

```

---

## File: src/shared/errors/errorHandler.js

```javascript
import logger from "../logger/logger.js";
import { ApiError } from "./ApiError.js";

export function errorHandler(err, req, res, next) {

  // Prisma errors
  if (err.code && err.code.startsWith("P")) {
    logger.error("Prisma error", { error: err });
    return res.status(500).json({
      status: 500,
      code: "PRISMA_ERROR",
      message: "Database error",
      details: err.meta || null
    });
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    logger.warn("ApiError", {
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
      path: req.originalUrl,
      method: req.method
    });

    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  // Generic / unknown errors
  logger.error("Unhandled error", {
    error: {
      message: err.message,
      stack: err.stack
    },
    path: req.originalUrl,
    method: req.method
  });

  return res.status(500).json({
    status: 500,
    code: "UNKNOWN_ERROR",
    message: "Une erreur interne est survenue"
  });
}

```

---

## File: src/app.js

```javascript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import logger from "./shared/logger/logger.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import { asyncHandler } from "./shared/middlewares/asyncHandler.js";
import path from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import profileRoutes from "./modules/profiles/profile.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import reactionRoutes from "./modules/reactions/reaction.routes.js";
import messageRoutes from "./modules/messages/messages.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
    crossOriginOpenerPolicy: false,                        
  })
);
app.use(cors({ origin: "*", credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

const uploadsPath = path.join(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });
  next();
});

app.use((req, res, next) => {
  req.io = global.io || null;
  next();
});

// health
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

// api
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// 404
app.use(
  /(.*)/,
  asyncHandler((_req, res) => {
    return res.status(404).json({
      status: 404,
      code: "NOT_FOUND",
      message: "Route introuvable"
    });
  })
);

app.use(errorHandler);

export default app;

```

---

## File: src/modules/auth/auth.service.js

```javascript
import prisma from "../../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { unauthorized, badRequest } from "../../shared/errors/ApiError.js";
import { generateRandomToken, hashToken } from "./auth.utils.js";
import { ROLES } from "../../shared/constants/roles.js";

dotenv.config();

class AuthService {
  generateAccessToken(user) {
    const isModerator =
      user.roleId === ROLES.ADMIN.id || user.roleId === ROLES.MODERATOR.id;

    return jwt.sign(
      {
        id: user.id,
        roleId: user.roleId,
        isModerator,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );
  }

  async generateAndStoreRefreshToken(userId) {
    const refreshToken = generateRandomToken();
    const hashed = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashed,
        expiresAt
      },
    });

    return refreshToken;
  }

  async register(data) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) throw badRequest("Email déjà utilisé");

    const hashedPassword = await bcrypt.hash(data.password, 10);


    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        roleId: ROLES.MEMBER.id,
      },
    });

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        bio: "",
        avatarUrl: "",
        phone: "",
        socialLinks: {},
      },
    });

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw unauthorized("Identifiants invalides");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw unauthorized("Identifiants invalides");

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    const hashed = hashToken(refreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash: hashed },
    });

    if (!stored) throw unauthorized("Refresh token invalide");

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) throw unauthorized("Utilisateur non trouvé");

    const permissions = await this.getPermissions(user.roleId);

    const accessToken = this.generateAccessToken(user, permissions);

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async getPermissions(roleId) {
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    return permissions.map((p) => p.permission.name);
  }
}

export default new AuthService();

```

---

## File: src/modules/auth/auth.utils.js

```javascript
import crypto from "crypto";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRandomToken() {
  return crypto.randomBytes(40).toString("hex");
}

```

---

## File: src/modules/auth/auth.routes.js

```javascript
import { Router } from "express";
import AuthController from "./auth.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema
} from "./auth.validator.js";

const router = Router();

router.post("/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post("/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post("/refresh",
  validate(refreshSchema),
  asyncHandler(AuthController.refresh)
);

export default router;

```

---

## File: src/modules/auth/auth.controller.js

```javascript
import AuthService from "./auth.service.js";
import { success } from "../../utils/apiResponse.js";
import { badRequest } from "../../shared/errors/ApiError.js";

class AuthController {

  async register(req, res) {
    const data = await AuthService.register(req.body);
    return success(res, data, "Inscription réussie", 201);
  }

  async login(req, res) {
    const data = await AuthService.login(req.body);
    return success(res, data, "Connexion réussie");
  }

  async refresh(req, res) {
    const token = req.body.refreshToken;
    if (!token) throw badRequest("Aucun refresh token envoyé", "NO_REFRESH_TOKEN");

    const data = await AuthService.refresh(token);
    return success(res, data, "Token renouvelé");
  }
}

export default new AuthController();

```

---

## File: src/utils/apiResponse.js

```javascript
export const success = (res, data = {}, message = "Opération réussie", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const error = (
  res,
  message = "Une erreur est survenue",
  status = 500,
  code = null
) => {
  return res.status(status).json({
    success: false,
    message,
    code,
  });
};

```

---

## File: src/shared/errors/ApiError.js

```javascript
export class ApiError extends Error {
  constructor(status, message, code = null, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code = "BAD_REQUEST", details = null) =>
  new ApiError(400, message, code, details);

export const unauthorized = (message = "Non authentifié", code = "UNAUTHORIZED") =>
  new ApiError(401, message, code);

export const forbidden = (message = "Accès refusé", code = "FORBIDDEN") =>
  new ApiError(403, message, code);

export const notFound = (message = "Ressource introuvable", code = "NOT_FOUND") =>
  new ApiError(404, message, code);

```

---

## File: src/modules/users/users.service.js

```javascript
import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class UsersService {

  

  async getAllUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: safeUserSelect
    });
  }

  async getById(userId) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: safeUserSelect
    });

    if (!user) throw notFound("Utilisateur introuvable");
    return user;
  }

  async updateUser(userId, requesterId, isModerator, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound("Utilisateur introuvable");

    if (user.id !== requesterId && !isModerator) {
      throw forbidden("Modification non autorisée");
    }

    const allowed = {};
    if (data.email) allowed.email = data.email;
    if (data.password) allowed.password = data.password;

    return prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: safeUserSelect
    });
  }

  async softDelete(userId, requesterId, isModerator) {
    if (userId !== requesterId && !isModerator) {
      throw forbidden("Suppression non autorisée");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("Utilisateur introuvable");

    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });
  }
}

export default new UsersService();

```

---

## File: src/modules/users/users.controller.js

```javascript
import UsersService from "./users.service.js";
import { success } from "../../utils/apiResponse.js";

class UsersController {
  async getAllUsers(req, res) {
    const users = await UsersService.getAllUsers();
    return success(res, users);
  }

  async getUser(req, res) {
    const user = await UsersService.getById(req.params.userId);
    return success(res, user);
  }

  async updateUser(req, res) {
    const updated = await UsersService.updateUser(
      req.params.userId,
      req.user.id,
      req.user.isModerator,
      req.body,
    );

    return success(res, updated, "Utilisateur mis à jour");
  }

  async deleteUser(req, res) {
    await UsersService.softDelete(
      req.params.userId,
      req.user.id,
      req.user.isModerator,
    );

    return success(res, null, "Utilisateur supprimé");
  }
}

export default new UsersController();

```

---

## File: src/modules/users/users.routes.js

```javascript
import { Router } from "express";
import UsersController from "./users.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { updateUserSchema } from "./users.validator.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";

const router = Router();

router.get("/", asyncHandler(UsersController.getAllUsers));

router.get(
  "/:userId",
  asyncHandler(UsersController.getUser)
);

router.put(
  "/:userId",
  auth(),
  requirePermission("PROFILE_UPDATE"),
  validate(updateUserSchema),
  asyncHandler(UsersController.updateUser)
);

router.delete(
  "/:userId",
  auth(),
  requirePermission("USER_DELETE"),
  asyncHandler(UsersController.deleteUser)
);


export default router;

```

---

## File: src/modules/posts/post.routes.js

```javascript
import { Router } from "express";
import PostController from "./post.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { uploadAttachments } from "./attachment.upload.js";
import {
  createPostSchema,
  updatePostSchema,
  listPostsSchema
} from "./post.validator.js";

const router = Router();

router.get(
  "/user/:userId",
  auth(),
  asyncHandler(PostController.getByUserId)
);

router.get(
  "/",
  auth(),
  validate(listPostsSchema, "query"),
  asyncHandler(PostController.list)
);

router.get(
  "/:postId",
  asyncHandler(PostController.getById)
);

router.post(
  "/",
  auth(),
  requirePermission("POST_CREATE"),
  uploadAttachments,
  validate(createPostSchema),
  asyncHandler(PostController.create)
);



router.put(
  "/:postId",
  auth(),
  requirePermission("POST_UPDATE"),
  validate(updatePostSchema),
  asyncHandler(PostController.update)
);

router.delete(
  "/:postId",
  auth(),
  requirePermission("POST_DELETE"),
  asyncHandler(PostController.remove)
);

export default router;

```

---

## File: src/modules/posts/post.controller.js

```javascript
import PostService from "./post.service.js";
import FeedService from "./feed.service.js";
import { success } from "../../utils/apiResponse.js";

class PostController {

  async getByUserId(req, res) {
    const posts = await PostService.getPostByUserId(req.params.userId,req.user?.id);
    return success(res, posts);
  }

  async create(req, res) {
    const post = await PostService.create(req.user.id, req.body, req.files);

    return success(res, post, "Post créé", 201);
  }

  async getById(req, res) {
    const post = await PostService.getById(req.params.postId);
    return success(res, post);
  }

  async update(req, res) {
    const updated = await PostService.update(
      req.params.postId,
      req.user.id,
      req.user.isModerator,
      req.body,
    );

    return success(res, updated, "Post mis à jour");
  }

  async remove(req, res) {
    await PostService.remove(
      req.params.postId,
      req.user.id,
      req.user.isModerator,
    );

    return success(res, null, "Post supprimé");
  }

  async list(req, res) {
  // Valeurs avec fallback si aucun query param
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const { categoryId } = req.query;

  const posts = await FeedService.list(
    page,
    limit,
    categoryId,
    req.user?.id
  );

  return success(res, posts);
}
}

export default new PostController();

```

---

## File: src/modules/posts/post.service.js

```javascript
import PostRepository from "./post.repository.js";
import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { generateId } from "../../utils/idGenerator.js";
import AttachmentService from "./attachment.service.js";
import { prepareFiles } from "./attachment.upload.js";

class PostService {

  async getPostByUserId(userId,userConnected) {
    return PostRepository.findByUserId(userId,userConnected);
  }

  async create(userId, data, files) {
    const id = await generateId("post", "PST-");

    const post = await PostRepository.create({
      id,
      userId,
      title: data.title,
      content: data.content,
      categoryId: data.categoryId || null,
    });

    if (files?.length) {
      const prepared = await prepareFiles(files);
      await AttachmentService.processAndStore(post.id, prepared);
    }

    return this.getById(post.id);
  }

  async getById(postId) {
    const post = await PostRepository.findById(postId);
    if (!post) throw notFound("Post introuvable");
    return post;
  }

  async update(postId, userId, isModerator, data) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted) throw notFound("Post introuvable");

    if (post.userId !== userId && !isModerator) {
      throw forbidden("Modification non autorisée");
    }

    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.categoryId !== undefined)
      payload.categoryId = data.categoryId || null;

    return PostRepository.update(postId, payload);
  }

  async remove(postId, userId, isModerator) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted) throw notFound("Post introuvable");

    if (post.userId !== userId && !isModerator) {
      throw forbidden("Suppression non autorisée");
    }

    return PostRepository.softDelete(postId);
  }
}

export default new PostService();

```

---

## File: src/modules/posts/post.repository.js

```javascript
import prisma from "../../config/database.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";

class PostRepository {

async findByUserId(userId,userConnected) {
  const posts = await prisma.post.findMany({
    where: { userId, deleted: false },
    include: {
      user: { select: safeUserSelect },
      attachments: true,
      _count: { select: { comments: true, reactions: true } }
    }
  });
   if (userConnected) {
      for (const post of posts) {
        const reaction = await prisma.reaction.findFirst({
          where: {
            postId: post.id,
            userId: userConnected
          },
          select: {
            id: true,
            reactionType: true
          }
        });

        post.myReaction = reaction || null;
      }
    } else {
      for (const post of posts) post.myReaction = null;
    }

  return posts;
}

  async create(data) {
    return prisma.post.create({
      data,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async findById(postId) {
    return prisma.post.findFirst({
      where: { id: postId, deleted: false },
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async update(postId, data) {
    return prisma.post.update({
      where: { id: postId },
      data,
      include: {
        user: { select: safeUserSelect },
        attachments: true,
        _count: { select: { comments: true, reactions: true } }
      }
    });
  }

  async softDelete(postId) {
    return prisma.post.update({
      where: { id: postId },
      data: { deleted: true }
    });
  }
}

export default new PostRepository();

```

---

## File: src/modules/posts/attachment.upload.js

```javascript
import multer from "multer";
import FileUtils from "../../utils/file.utils.js";
import uploadConfig from "../../config/upload.config.js";
import { join } from "path";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadConfig.storage.temp);
  },
  filename: (req, file, cb) => {
    const unique = FileUtils.generateUniqueFileName(file.originalname);
    cb(null, unique);
  }
});

export const uploadAttachments = multer({
  storage,
  limits: { fileSize: uploadConfig.limits.default }
}).array("files", 10);


export async function prepareFiles(files) {
  const prepared = [];

  for (const file of files) {
    const tempPath = file.path;
    const fileType = FileUtils.getFileType(file.mimetype);

    // Validation taille
    if (!FileUtils.validateFileSize(file.size, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Validation extension
    if (!FileUtils.validateExtension(file.originalname, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Validation MIME
    if (!FileUtils.validateMimeType(file.mimetype, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Destination finale selon type
    const destFolder = FileUtils.getDestinationFolder(fileType, uploadConfig);
    const finalPath = join(destFolder, file.filename);

    prepared.push({
      tempPath,
      finalPath,
      fileType,
      fileName: file.filename,
      fileSize: file.size,
      mimetype: file.mimetype
    });
  }

  return prepared;
}

```

---

## File: src/modules/posts/attachment.service.js

```javascript
import prisma from "../../config/database.js";
import FileUtils from "../../utils/file.utils.js";
import { promises as fs } from "fs";
import path from "node:path";

const UPLOADS_ROOT = path.resolve("uploads"); // doit pointer vers ton dossier uploads
const UPLOADS_PREFIX = "/uploads"; // ce sera ta route publique

class AttachmentService {
  async processAndStore(postId, preparedFiles) {
    const results = [];

    for (const file of preparedFiles) {
      // Scan basique
      const scan = await FileUtils.scanFile(file.tempPath);
      if (!scan.safe) {
        await FileUtils.deleteFile(file.tempPath);
        continue;
      }

      // Si image : optimize & thumbnail
      if (file.fileType === "image") {
        await FileUtils.optimizeImage(file.tempPath);
        const thumbPath = file.tempPath + "_thumb.webp";

        await FileUtils.createThumbnail(file.tempPath, thumbPath, 300);
      }

      // Move final file
      await fs.rename(file.tempPath, file.finalPath);

      console.log("Saved file at:", file.finalPath);

      // 🟢 Construire l'URL publique
      // file.finalPath ≈ F:/SVNM/forum-backend/uploads/others/xxx.png
      // UPLOADS_ROOT  ≈ F:/SVNM/forum-backend/uploads
      let relativePath = path.relative(UPLOADS_ROOT, file.finalPath); // => "others/xxx.png"
      relativePath = relativePath.replace(/\\/g, "/"); // Windows → URL friendly

      const publicUrl = `${UPLOADS_PREFIX}/${relativePath}`; // => "/uploads/others/xxx.png"

      const attachment = await prisma.attachment.create({
        data: {
          id: file.fileName,
          postId,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          fileUrl: publicUrl, // 🟢 URL WEB, plus de "F:/..."
        },
      });

      results.push(attachment);
    }

    return results;
  }
}

export default new AttachmentService();

```

---

## File: src/modules/comments/comment.routes.js

```javascript
import { Router } from "express";
import CommentController from "./comment.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import {
  createCommentSchema,
  updateCommentSchema
} from "./comment.validator.js";

const router = Router();

router.get(
  "/:postId",
  auth(),
  asyncHandler(CommentController.list)
);

router.post(
  "/",
  auth(),
  requirePermission("COMMENT_CREATE"),
  validate(createCommentSchema),
  asyncHandler(CommentController.create)
);

router.put(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_UPDATE"),
  validate(updateCommentSchema),
  asyncHandler(CommentController.update)
);

router.delete(
  "/:commentId",
  auth(),
  requirePermission("COMMENT_DELETE"),
  asyncHandler(CommentController.remove)
);

export default router;

```

---

## File: src/modules/comments/comment.controller.js

```javascript
import CommentService from "./comment.service.js";
import { success } from "../../utils/apiResponse.js";

class CommentController {

  async list(req, res) {
    const result = await CommentService.list(req.params.postId,req.user?.id, Number(req.query.skip) || 0, Number(req.query.take) || 20);
    return success(res, result, "Liste des commentaires");
  }
  
  async create(req, res) {
    const result = await CommentService.create(req.user.id, req.body, req.io);
    return success(res, result, "Commentaire ajouté", 201);
  }

  async update(req, res) {
    const result = await CommentService.update(
      req.params.commentId,
      req.user.id,
      req.user.isModerator,
      req.body.content
    );
    return success(res, result, "Commentaire modifié");
  }

  async remove(req, res) {
    await CommentService.remove(
      req.params.commentId,
      req.user.id,
      req.user.isModerator
    );
    return success(res, null, "Commentaire supprimé");
  }
}

export default new CommentController();

```

---

## File: src/modules/comments/comment.service.js

```javascript
import prisma from "../../config/database.js";
import { notFound, forbidden } from "../../shared/errors/ApiError.js";
import { safeUserSelect } from "../../shared/selectors/safeUserSelect.js";
import { generateId } from "../../utils/idGenerator.js";
import NotificationService from "../notifications/notification.service.js";

class CommentService {
  async create(userId, data, io) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId, deleted: false },
    });

    if (!post) throw notFound("Post introuvable");

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const id = await generateId("comment", "CMT-");

    await NotificationService.notify(
      post.userId, // destinataire
      userId, // acteur
      "POST_COMMENTED",
      "Nouveau commentaire",
      `${profile.fullName} a commenté votre post`,
      post.id,
      "POST",
      io,
    );

    return prisma.comment.create({
      data: {
        id,
        userId,
        postId: data.postId,
        content: data.content,
      },
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } },
      },
    });
  }

  async update(commentId, userId, isModerator, content) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } },
      },
    });
  }

  async remove(commentId, userId, isModerator) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw notFound("Commentaire introuvable");

    if (comment.userId !== userId && !isModerator)
      throw forbidden("Non autorisé");

    return prisma.comment.delete({ where: { id: commentId } });
  }

  async list(postId, userId, skip = 0, take = 20) {
    const comment = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      skip,
      take,
      include: {
        user: { select: safeUserSelect },
        _count: { select: { reactions: true } },
      },
    });

    if (userId) {
      for (const coms of comment) {
        const reaction = await prisma.reaction.findFirst({
          where: {
            commentId: coms.id,
            userId: userId,
          },
          select: {
            id: true,
            reactionType: true,
          },
        });
        coms.myReaction = reaction || null;
      }
    } else {
      for (const coms of comment) coms.myReaction = null;
    }
    return comment;
  }
}

export default new CommentService();

```

---

## File: src/modules/messages/message.controller.js

```javascript
import ConversationService from "./conversation.service.js";
import { success } from "../../utils/apiResponse.js";

class MessageController {

  async list(req, res) {
    const { cursor, limit } = req.query;

    const result = await ConversationService.getMessages(
      req.params.conversationId,
      cursor,
      Number(limit)
    );

    return success(res, result);
  }

  async send(req, res) {
    const msg = await ConversationService.sendMessage(
      req.body.conversationId,
      req.user.id,
      req.body.content,req.io
    );

    req.io.to(req.body.conversationId).emit("message:new", msg);

    return success(res, msg, "Message envoyé");
  }
}

export default new MessageController();

```

---

## File: src/modules/messages/conversation.controller.js

```javascript
import ConversationService from "./conversation.service.js";
import { success } from "../../utils/apiResponse.js";

class ConversationController {
  async create(req, res) {
    const conversation = await ConversationService.create(req.user.id, req.body.members);
    return success(res, conversation, "Conversation créée", 201);
  }

  async list(req, res) {
    return success(res, await ConversationService.list(req.params.conversationId, req.query));
  }

  async listConversations(req, res) {
    const list = await ConversationService.listUserConversations(req.user.id);
    return success(res, list);
  }
}

export default new ConversationController();

```

---

## File: src/modules/messages/messages.routes.js

```javascript
import { Router } from "express";
import MessageController from "./message.controller.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import { validate } from "../../shared/middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/requirePermission.js";
import { sendMessageSchema, messageListSchema } from "./message.validator.js";
import ConversationService from "./conversation.service.js";
import { forbidden } from "../../shared/errors/ApiError.js";
import ConversationController from "./conversation.controller.js";
import { createConversationSchema } from "./conversation.validator.js";

const router = Router();

// Check membership before listing messages
router.post(
  "/conversations",
  auth(),
  requirePermission("CONVERSATION_CREATE"),
  validate(createConversationSchema),
  asyncHandler(ConversationController.create)
);

router.get(
  "/conversations",
  auth(),
  requirePermission("CONVERSATION_LIST"),
  asyncHandler(ConversationController.listConversations)
);

router.get(
  "/:conversationId",
  auth(),
  asyncHandler(async (req, res, next) => {
    const isMember = await ConversationService.isMember(
      req.params.conversationId,
      req.user.id,
    );
    if (!isMember) throw forbidden("Vous n'êtes pas membre de la conversation");
    next();
  }),
  validate(messageListSchema, "query"),
  asyncHandler(MessageController.list),
);

router.post(
  "/send",
  auth(),
  requirePermission("MESSAGE_SEND"),
  validate(sendMessageSchema),
  asyncHandler(MessageController.send),
);

export default router;

```

---

## File: src/shared/constants/roles.js

```javascript
export const ROLES = {
  ADMIN: {
    id: "ROLE001",
    name: "ADMIN"
  },
  MODERATOR: {
    id: "ROLE002",
    name: "MODERATOR"
  },
  MEMBER: {
    id: "ROLE003",
    name: "MEMBER"
  }
};

export const ROLE_LIST = Object.values(ROLES);

```

---

## File: src/shared/constants/acl.js

```javascript
import { PERMISSIONS } from "./permission.js";
import { ROLES } from "./roles.js";

export const ACL = {
  [ROLES.ADMIN.id]: [
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.POST_DELETE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.REACTION_CREATE,
    PERMISSIONS.REACTION_DELETE,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.PROFILE_UPDATE
  ],

  [ROLES.MODERATOR.id]: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.REACTION_DELETE,
    PERMISSIONS.MESSAGE_SEND
  ],

  [ROLES.MEMBER.id]: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.REACTION_CREATE,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.COMMENT_UPDATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.REACTION_DELETE,
    PERMISSIONS.CONVERSATION_LIST,
    PERMISSIONS.CONVERSATION_CREATE
  ]
};

```

---

## File: src/shared/selectors/safeUserSelect.js

```javascript
export const safeUserSelect = {
  id: true,
  email: true,
  roleId: true,
  profile: {
    select: {
      fullName: true,
      avatarUrl: true
    }
  }
};

```

---

## File: src/config/database.js

```javascript
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export default prisma;

```

---

(End of combined file)
