var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var E = { NFL: { sport: "football", league: "nfl" }, MLB: { sport: "baseball", league: "mlb" }, NHL: { sport: "hockey", league: "nhl" } };
var cors = /* @__PURE__ */ __name((r, e) => {
  const o = r.headers.get("Origin") || "", a = (e.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim());
  return a.includes(o) ? { "Access-Control-Allow-Origin": o, Vary: "Origin", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } : {};
}, "cors");
var out = /* @__PURE__ */ __name((d, r, e, t = 300, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${t}`, ...cors(r, e) } }), "out");
var get = /* @__PURE__ */ __name(async (u, r, e, t) => {
  const k = new Request(u), h = await caches.default.match(k);
  if (h) return new Response(h.body, { headers: { ...Object.fromEntries(h.headers), ...cors(r, e) } });
  const x = await fetch(u, { headers: { Accept: "application/json" } });
  if (!x.ok) throw Error(`Upstream HTTP ${x.status}`);
  const c = new Response(x.body, { headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${t}` } });
  await caches.default.put(k, c.clone());
  return new Response(c.body, { headers: { ...Object.fromEntries(c.headers), ...cors(r, e) } });
}, "get");
var expand = /* @__PURE__ */ __name(async (l, r, e) => {
  const raw = await (await get(`https://sports.core.api.espn.com/v2/sports/${E[l].sport}/leagues/${E[l].league}/teams?limit=${l === "NFL" ? 32 : 30}`, r, e, 86400)).json(), failures = [];
  const teams = (await Promise.all((raw.items || []).map(async (i) => {
    try {
      const d = await (await fetch(i.$ref)).json();
      return { id: String(d.id), name: d.name, displayName: d.displayName, shortDisplayName: d.shortDisplayName, abbreviation: d.abbreviation, logo: d.logos?.[0]?.href || d.logo || null };
    } catch (x) {
      failures.push(i.$ref);
      return null;
    }
  }))).filter(Boolean);
  return out({ teams, failures }, r, e, 86400);
}, "expand");
var src_default = { async fetch(r, e) {
  if (r.method === "OPTIONS") return new Response(null, { headers: cors(r, e) });
  if (r.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: cors(r, e) });
  const { pathname, searchParams } = new URL(r.url), m = pathname.match(/^\/api\/(nfl|mlb|nhl)\/(scores|standings|teams)$/);
  if (!m) return out({ error: "Not found" }, r, e, 0, 404);
  const l = m[1].toUpperCase(), q = m[2], c = E[l];
  try {
    if (q === "teams" && (l === "NFL" || l === "MLB")) return await expand(l, r, e);
    let u, t;
    if (q === "scores") {
      u = `https://site.api.espn.com/apis/site/v2/sports/${c.sport}/${c.league}/scoreboard?dates=${searchParams.get("date") || ""}`;
      t = 60;
    } else if (q === "standings") {
      u = l === "NHL" ? "https://api-web.nhle.com/v1/standings/now" : `https://site.api.espn.com/apis/v2/sports/${c.sport}/${c.league}/standings`;
      t = 600;
    } else {
      u = `https://site.api.espn.com/apis/site/v2/sports/${c.sport}/${c.league}/teams`;
      t = 86400;
    }
    return await get(u, r, e, t);
  } catch (x) {
    return out({ error: "Upstream unavailable" }, r, e, 30, 502);
  }
} };

// node_modules/.pnpm/wrangler@4.127.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/.pnpm/wrangler@4.127.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-82VCAR/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/.pnpm/wrangler@4.127.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-82VCAR/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
