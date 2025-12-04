import { fromNodeHeaders } from "better-auth/node";
import express, { type Request, type Response, type Router } from "express";
import {
  asyncHandler,
  sendError,
} from "@/lib/api-response-helper";
import { auth } from "@/lib/auth";
import { CartController } from "@/presentation/controllers/cart.controller";
import {
  cartAddItemBodySchema,
  cartRemoveItemParamsSchema,
  cartUpdateItemBodySchema,
  cartUpdateItemParamsSchema,
} from "@/presentation/validators/cart.validator";

type Identifier = {
  userId?: string;
  sessionId?: string;
};

export function createCartRoutes(controller: CartController): Router {
  const router = express.Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const identifier = await resolveIdentifier(req, res);
      if (!identifier) {
        return;
      }
      await controller.getCart(identifier, res);
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const identifier = await resolveIdentifier(req, res);
      if (!identifier) {
        return;
      }

      const body = cartAddItemBodySchema.safeParse(req.body);
      if (!body.success) {
        sendError(
          res,
          body.error.issues[0]?.message ?? "Invalid request body",
          400
        );
        return;
      }

      await controller.addItem(identifier, body.data, res);
    })
  );

  router.put(
    "/items/:itemId",
    asyncHandler(async (req, res) => {
      const identifier = await resolveIdentifier(req, res);
      if (!identifier) {
        return;
      }

      const params = cartUpdateItemParamsSchema.safeParse(req.params);
      if (!params.success) {
        sendError(
          res,
          params.error.issues[0]?.message ?? "Invalid itemId parameter",
          400
        );
        return;
      }

      const body = cartUpdateItemBodySchema.safeParse(req.body);
      if (!body.success) {
        sendError(
          res,
          body.error.issues[0]?.message ?? "Invalid request body",
          400
        );
        return;
      }

      await controller.updateItem(
        {
          itemId: params.data.itemId,
          quantity: body.data.quantity,
        },
        res
      );
    })
  );

  router.delete(
    "/items/:itemId",
    asyncHandler(async (req, res) => {
      const identifier = await resolveIdentifier(req, res);
      if (!identifier) {
        return;
      }

      const params = cartRemoveItemParamsSchema.safeParse(req.params);
      if (!params.success) {
        sendError(
          res,
          params.error.issues[0]?.message ?? "Invalid itemId parameter",
          400
        );
        return;
      }

      await controller.removeItem(params.data.itemId, res);
    })
  );

  router.delete(
    "/",
    asyncHandler(async (req, res) => {
      const identifier = await resolveIdentifier(req, res);
      if (!identifier) {
        return;
      }
      await controller.clearCart(identifier, res);
    })
  );

  return router;
}

async function resolveIdentifier(
  req: Request,
  res: Response
): Promise<Identifier | null> {
  const session = await getOptionalSession(req);
  const userId = session?.user?.id;
  const sessionId = getSessionId(req);

  if (!userId && !sessionId) {
    sendError(
      res,
      "Session ID required for guest users. Please provide x-session-id header or sessionId cookie.",
      400
    );
    return null;
  }

  return { userId: userId ?? undefined, sessionId: sessionId ?? undefined };
}

async function getOptionalSession(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    return session;
  } catch {
    return null;
  }
}

function getSessionId(req: Request): string | undefined {
  const sessionHeader = req.headers["x-session-id"] as string | undefined;
  return sessionHeader;
}

