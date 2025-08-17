/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type TasksTaskID = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type GithubComOrbitSoftwareCryptoSteamInternalTasksStatus =
  | "pending"
  | "checkable"
  | "claimable"
  | "done";

export type GithubComOrbitSoftwareCryptoSteamInternalBlackholeDbBlackholeTier =
  | "gold"
  | "silver"
  | "bronze";

export type DbPostActionType = "open_game" | "other";

export type BlackholeLevel = 20;

export interface BlackholeAutoBurn {
  enabled: boolean;
  price?: number;
  stop?: number;
}

export interface BlackholeBurnCoinsResponse {
  burned_amount: number;
  new_rank: number;
  points_earned: number;
  transaction_id: number;
}

export interface BlackholeBuyChestResponse {
  box_id: number;
  transaction_id: number;
}

export interface BlackholeInfoResponse {
  auto_burn: BlackholeAutoBurn;
  burned: number;
  chest_price: number;
  limit: BlackholeLimit;
  neighbors?: BlackholeLeaderboardEntry[];
  position: number;
  rewards: Record<string, number>;
  tier: GithubComOrbitSoftwareCryptoSteamInternalBlackholeDbBlackholeTier;
}

export interface BlackholeLeaderboardEntry {
  avatar_url: string;
  /** The user's balance that determines their rank. */
  balance: number;
  name: string;
  /** The user's rank in the leaderboard. */
  position: number;
  /** The unique identifier of the user. */
  user_id: number;
}

export interface BlackholeLeaderboardResponse {
  entries: BlackholeLeaderboardEntry[];
  entries_total: number;
  tier: GithubComOrbitSoftwareCryptoSteamInternalBlackholeDbBlackholeTier;
}

export interface BlackholeLimit {
  burned: number;
  level: BlackholeLevel;
  limit: number;
  multiplier: number;
  next?: BlackholeNextLimit;
}

export interface BlackholeNextLimit {
  level: BlackholeLevel;
  limit: number;
  multiplier: number;
  price?: number;
}

export interface DbPostAction {
  game_id?: number;
  label?: string;
  type: DbPostActionType;
}

export interface DbPostContent {
  actions: DbPostAction[];
  description: string;
  title: string;
}

export interface FeedCommentsResponse {
  comments: FeedDtoComment[];
}

export interface FeedDtoAuthor {
  avatar: string;
  id: number;
  name: string;
}

export interface FeedDtoComment {
  author: FeedDtoAuthor;
  created: string;
  id: number;
  text: string;
}

export interface FeedDtoGame {
  avatar: string;
  id: number;
  liked_rating: number;
  players: number;
  title: string;
}

export interface FeedDtoMedium {
  comments: number;
  created: string;
  description: string;
  game: FeedDtoGame;
  id: string;
  is_liked: boolean;
  likes: number;
  shares: number;
  url: string;
  views: number;
}

export interface FeedMediaResponse {
  media: FeedDtoMedium[];
}

export interface HttpErrorResponse {
  error: string;
}

export interface InventoryReward {
  reward_type: string;
  reward_value: number;
}

export interface PaymentsResponse {
  items: PaymentsTopUpItemWithInvoice[];
}

export interface PaymentsTopUpItemWithInvoice {
  /** Reward amount in gems */
  gems: number;
  invoice_url: string;
  /** Cost in Telegram Stars */
  stars: number;
}

export interface RestStatusResponse {
  status: string;
}

export interface ResterrErrResponse {
  error?: string;
  status_text: string;
}

export interface ServiceBoxContentResponse {
  rewards: InventoryReward[];
}

export interface ServiceBoxOpenResponse {
  extra?: string;
  reward_type: string;
  reward_value: number;
}

export interface ServiceCommentCreateRequest {
  text: string;
}

export interface ServiceInvoiceCreatedResponse {
  invoice_link: string;
}

export interface StoriesGroup {
  image_url: string;
  posts: StoriesPost[];
  title: string;
}

export interface StoriesListStoriesResponse {
  stories: StoriesGroup[];
}

export interface StoriesPost {
  background_image_url: string;
  content: DbPostContent;
  id: number;
  watched: boolean;
}

export interface TasksListResponse {
  daily_streak: number;
  tasks: TasksTaskResponse[];
}

export interface TasksTaskResponse {
  description: string;
  group?: string;
  group_position?: number;
  id: TasksTaskID;
  params: string;
  reward: number;
  status: GithubComOrbitSoftwareCryptoSteamInternalTasksStatus;
  sub_title?: string;
  title: string;
}

export interface WageringUpdateWageValueRequest {
  value: number;
}

export interface WageringWage {
  current_value?: number;
  id?: number;
  max_value: number;
  price: number;
  started_at?: string;
  time_limit: string;
  title: string;
  type_id?: number;
}

export interface WageringWagesResponse {
  active_wages: WageringWage[];
  available_wages: WageringWage[];
  claimable_wages: WageringWage[];
}

export interface WalletChargeGSMoneyRequest {
  amount: number;
  game_id: number;
  user_id: number;
}

export interface WalletCreateWithdrawalRequest {
  currency: string;
  value: number;
}

export interface FeedMediaListParams {
  /**
   * Number of media items to return
   * @default 20
   */
  limit?: number;
}

export interface FeedMediaCommentsListParams {
  /** From timestamp (RFC3339 format) */
  from?: string;
  /** Media ID */
  mediaId: string;
}

export interface V2LeaderboardListParams {
  /**
   * Tier filter
   * @default "bronze"
   */
  tier?: "gold" | "silver" | "bronze";
}

export interface V2LeaderboardBurnCreateParams {
  /**
   * Amount to burn
   * @default "limit"
   * @example "100"
   */
  amount?: string;
}

export interface V2LeaderboardUpgradeLevelCreateParams {
  /** Level to upgrade to */
  level: number;
}

export interface V1AdsCallbackListParams {
  /** string valid */
  ymid: string;
  /** string valid */
  event: string;
  /** string valid */
  zone_id: string;
  /** string valid */
  request_var: string;
  /** telegrem user id */
  telegram_id: number;
  /** price */
  estimated_price: number;
  /** wage id */
  id: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Portal API
 * @version 1.0
 * @license Private
 * @contact
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  admin = {
    /**
     * No description
     *
     * @tags admin, stories
     * @name V1StoriesResetCreate
     * @summary Reset watched stories
     * @request POST:/admin/v1/stories/reset
     * @response `200` `RestStatusResponse` OK
     */
    v1StoriesResetCreate: (id: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/admin/v1/stories/reset`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
  api = {
    /**
     * No description
     *
     * @tags api, feed
     * @name FeedCommentsDelete
     * @summary Delete comment
     * @request DELETE:/api/feed/comments/{commentID}
     * @response `200` `RestStatusResponse` OK
     */
    feedCommentsDelete: (commentId: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/feed/comments/${commentId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaCommentsCreate
     * @summary Create comment on media
     * @request POST:/api/feed/media/{mediaID}/comments
     * @response `201` `FeedDtoComment` Created
     */
    feedMediaCommentsCreate: (
      mediaId: string,
      request: ServiceCommentCreateRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<FeedDtoComment, any>({
        path: `/api/feed/media/${mediaId}/comments`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaCommentsList
     * @summary Get comments for media
     * @request GET:/api/feed/media/{mediaID}/comments
     * @response `200` `FeedCommentsResponse` OK
     */
    feedMediaCommentsList: (
      { mediaId, ...query }: FeedMediaCommentsListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<FeedCommentsResponse, any>({
        path: `/api/feed/media/${mediaId}/comments`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaLikeCreate
     * @summary Like media
     * @request POST:/api/feed/media/{mediaID}/like
     * @response `200` `RestStatusResponse` OK
     */
    feedMediaLikeCreate: (mediaId: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/feed/media/${mediaId}/like`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaLikeDelete
     * @summary Unlike media
     * @request DELETE:/api/feed/media/{mediaID}/like
     * @response `200` `RestStatusResponse` OK
     */
    feedMediaLikeDelete: (mediaId: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/feed/media/${mediaId}/like`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaList
     * @summary Get media feed for user
     * @request GET:/api/feed/media
     * @response `200` `FeedMediaResponse` OK
     */
    feedMediaList: (query: FeedMediaListParams, params: RequestParams = {}) =>
      this.http.request<FeedMediaResponse, any>({
        path: `/api/feed/media`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaShareCreate
     * @summary Share media
     * @request POST:/api/feed/media/{mediaID}/share
     * @response `200` `RestStatusResponse` OK
     */
    feedMediaShareCreate: (mediaId: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/feed/media/${mediaId}/share`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, feed
     * @name FeedMediaViewCreate
     * @summary Mark media as viewed
     * @request POST:/api/feed/media/{mediaID}/view
     * @response `200` `RestStatusResponse` OK
     */
    feedMediaViewCreate: (mediaId: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/feed/media/${mediaId}/view`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, inventory
     * @name InventoryDetail
     * @summary show box contents
     * @request GET:/api/inventory/{boxID}
     * @response `200` `ServiceBoxContentResponse` returns box content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    inventoryDetail: (boxId: string, params: RequestParams = {}) =>
      this.http.request<ServiceBoxContentResponse, ResterrErrResponse>({
        path: `/api/inventory/${boxId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, inventory
     * @name InventoryOpenCreate
     * @summary show box contents
     * @request POST:/api/inventory/{boxID}/open
     * @response `200` `ServiceBoxOpenResponse` returns box content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    inventoryOpenCreate: (boxId: string, params: RequestParams = {}) =>
      this.http.request<ServiceBoxOpenResponse, ResterrErrResponse>({
        path: `/api/inventory/${boxId}/open`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, shop
     * @name InvoiceNoAdsCancelCreate
     * @summary cancel subscription
     * @request POST:/api/invoice/no_ads/cancel
     * @response `204` `void` No Content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    invoiceNoAdsCancelCreate: (params: RequestParams = {}) =>
      this.http.request<void, ResterrErrResponse>({
        path: `/api/invoice/no_ads/cancel`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, shop
     * @name InvoiceNoAdsCreate
     * @summary give invoice url for no ads subscription
     * @request POST:/api/invoice/no_ads
     * @response `200` `ServiceInvoiceCreatedResponse` returns invoice url
     * @response `500` `ResterrErrResponse` Internal server error
     */
    invoiceNoAdsCreate: (params: RequestParams = {}) =>
      this.http.request<ServiceInvoiceCreatedResponse, ResterrErrResponse>({
        path: `/api/invoice/no_ads`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags payments
     * @name PricesList
     * @summary get payment items with invoice URLs
     * @request GET:/api/prices
     * @response `200` `PaymentsResponse` OK
     */
    pricesList: (params: RequestParams = {}) =>
      this.http.request<PaymentsResponse, any>({
        path: `/api/prices`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, stories
     * @name V1StoriesList
     * @summary Get stories for current user
     * @request GET:/api/v1/stories
     * @response `200` `StoriesListStoriesResponse` OK
     */
    v1StoriesList: (params: RequestParams = {}) =>
      this.http.request<StoriesListStoriesResponse, any>({
        path: `/api/v1/stories`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, stories
     * @name V1StoriesWatchCreate
     * @summary Get stories for current user
     * @request POST:/api/v1/stories/{id}/watch
     * @response `200` `RestStatusResponse` OK
     */
    v1StoriesWatchCreate: (id: string, params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, any>({
        path: `/api/v1/stories/${id}/watch`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, tasks
     * @name V1TasksList
     * @summary Get tasks list
     * @request GET:/api/v1/tasks
     * @response `200` `TasksListResponse` OK
     */
    v1TasksList: (params: RequestParams = {}) =>
      this.http.request<TasksListResponse, any>({
        path: `/api/v1/tasks`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, wallet
     * @name V1WalletWithdrawalCreate
     * @summary Create withdrawal request
     * @request POST:/api/v1/wallet/withdrawal
     * @response `204` `void` No Content
     */
    v1WalletWithdrawalCreate: (
      body: WalletCreateWithdrawalRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/api/v1/wallet/withdrawal`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Burns coins up to the hourly/daily limit and converts them to leaderboard points
     *
     * @tags api, blackhole
     * @name V2LeaderboardBurnCreate
     * @summary Burn coins to earn leaderboard points
     * @request POST:/api/v2/leaderboard/burn
     * @response `200` `BlackholeBurnCoinsResponse` Successful burn with transaction ID, points earned and new rank
     * @response `400` `ResterrErrResponse` Insufficient funds or limit exceeded
     * @response `500` `ResterrErrResponse` Internal server error
     * @response `503` `void` Service temporarily unavailable - burn operation is locked
     */
    v2LeaderboardBurnCreate: (
      query: V2LeaderboardBurnCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<BlackholeBurnCoinsResponse, ResterrErrResponse | void>({
        path: `/api/v2/leaderboard/burn`,
        method: "POST",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, blackhole
     * @name V2LeaderboardBuyChestCreate
     * @summary Buy a chest to lose money faster
     * @request POST:/api/v2/leaderboard/buy-chest
     * @response `200` `BlackholeBuyChestResponse` Returns box id in the inventory
     * @response `400` `ResterrErrResponse` Insufficient funds or limit exceeded
     * @response `500` `ResterrErrResponse` Internal server error
     */
    v2LeaderboardBuyChestCreate: (params: RequestParams = {}) =>
      this.http.request<BlackholeBuyChestResponse, ResterrErrResponse>({
        path: `/api/v2/leaderboard/buy-chest`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Returns current tier, position, hourly and daily burn limits with current burned amounts
     *
     * @tags api, blackhole
     * @name V2LeaderboardInfoList
     * @summary Get user's blackhole information
     * @request GET:/api/v2/leaderboard/info
     * @response `200` `BlackholeInfoResponse` OK
     */
    v2LeaderboardInfoList: (params: RequestParams = {}) =>
      this.http.request<BlackholeInfoResponse, any>({
        path: `/api/v2/leaderboard/info`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Returns leaderboard entries for the specified tier (defaults to bronze)
     *
     * @tags api, blackhole
     * @name V2LeaderboardList
     * @summary Get current week leaderboard
     * @request GET:/api/v2/leaderboard
     * @response `200` `BlackholeLeaderboardResponse` Leaderboard with tier and ranked entries
     * @response `500` `ResterrErrResponse` Internal server error
     */
    v2LeaderboardList: (
      query: V2LeaderboardListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<BlackholeLeaderboardResponse, ResterrErrResponse>({
        path: `/api/v2/leaderboard`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Purchases an upgrade to increase hourly or daily burn limits
     *
     * @tags api, blackhole
     * @name V2LeaderboardUpgradeAutoBurnCreate
     * @summary Purchase an auto-burn upgrade
     * @request POST:/api/v2/leaderboard/upgrade/auto-burn
     * @response `200` `RestStatusResponse` Upgrade purchased successfully
     * @response `400` `ResterrErrResponse` Invalid upgrade type or insufficient funds
     * @response `500` `ResterrErrResponse` Internal server error
     */
    v2LeaderboardUpgradeAutoBurnCreate: (params: RequestParams = {}) =>
      this.http.request<RestStatusResponse, ResterrErrResponse>({
        path: `/api/v2/leaderboard/upgrade/auto-burn`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Purchases an upgrade to increase hourly or daily burn limits
     *
     * @tags api, blackhole
     * @name V2LeaderboardUpgradeLevelCreate
     * @summary Purchase an upgrade
     * @request POST:/api/v2/leaderboard/upgrade/level
     * @response `200` `RestStatusResponse` Upgrade purchased successfully
     * @response `400` `ResterrErrResponse` Invalid upgrade type or insufficient funds
     * @response `500` `ResterrErrResponse` Internal server error
     */
    v2LeaderboardUpgradeLevelCreate: (
      query: V2LeaderboardUpgradeLevelCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<RestStatusResponse, ResterrErrResponse>({
        path: `/api/v2/leaderboard/upgrade/level`,
        method: "POST",
        query: query,
        format: "json",
        ...params,
      }),
  };
  b2B = {
    /**
     * No description
     *
     * @tags b2b, ads
     * @name V1AdsCallbackList
     * @summary store callback about watched ads from monetag
     * @request GET:/b2b/v1/ads_callback
     * @response `204` `void` No Content
     */
    v1AdsCallbackList: (
      { id, ...query }: V1AdsCallbackListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/b2b/v1/ads_callback`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, wagering
     * @name V1WagesMarketjsSubmitScoreCreate
     * @summary update wage value from MarketJS hook
     * @request POST:/b2b/v1/wages/marketjs/submitScore
     * @response `200` `void` OK
     */
    v1WagesMarketjsSubmitScoreCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/b2b/v1/wages/marketjs/submitScore`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, wagering
     * @name V1WagesUpdate
     * @summary update wage value from game backend
     * @request PUT:/b2b/v1/wages/{id}
     * @response `204` `void` No Content
     */
    v1WagesUpdate: (
      id: string,
      body: WageringUpdateWageValueRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/b2b/v1/wages/${id}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, wallet
     * @name V1WalletBalanceGsCreate
     * @summary balance game specific currency
     * @request POST:/b2b/v1/wallet/balance_gs
     * @response `204` `void` No Content
     */
    v1WalletBalanceGsCreate: (
      body: WalletChargeGSMoneyRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/b2b/v1/wallet/balance_gs`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, wallet
     * @name V1WalletChargeGsCreate
     * @summary Create withdrawal request
     * @request POST:/b2b/v1/wallet/charge_gs
     * @response `204` `void` No Content
     */
    v1WalletChargeGsCreate: (
      body: WalletChargeGSMoneyRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/b2b/v1/wallet/charge_gs`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, wallet
     * @name V1WalletDepositGsCreate
     * @summary Deposit game specific currency
     * @request POST:/b2b/v1/wallet/deposit_gs
     * @response `204` `void` No Content
     */
    v1WalletDepositGsCreate: (
      body: WalletChargeGSMoneyRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/b2b/v1/wallet/deposit_gs`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags b2b, xsolla
     * @name XsollaWebhookCreate
     * @summary Xsolla Offerwall webhook endpoint
     * @request POST:/b2b/xsolla/webhook
     * @response `200` `string` OK
     * @response `400` `HttpErrorResponse` Bad Request
     * @response `401` `HttpErrorResponse` Unauthorized
     */
    xsollaWebhookCreate: (body: object, params: RequestParams = {}) =>
      this.http.request<string, HttpErrorResponse>({
        path: `/b2b/xsolla/webhook`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),
  };
  open = {
    /**
     * @description Finds game by ID and redirects user to the game's frontend URL
     *
     * @tags games, redirect
     * @name OpenDetail
     * @summary Open game by redirecting to its frontend domain
     * @request GET:/open/{id}
     * @response `302` `void` Redirect to game frontend domain
     * @response `400` `HttpErrorResponse` Invalid game ID
     * @response `404` `HttpErrorResponse` Game not found
     * @response `500` `HttpErrorResponse` Internal server error
     * @response `503` `HttpErrorResponse` Game domain not configured
     */
    openDetail: (id: number, params: RequestParams = {}) =>
      this.http.request<any, void | HttpErrorResponse>({
        path: `/open/${id}`,
        method: "GET",
        ...params,
      }),
  };
  sdk = {
    /**
     * No description
     *
     * @tags sdk, inventory
     * @name InventoryDetail
     * @summary show box contents
     * @request GET:/sdk/inventory/{boxID}
     * @response `200` `ServiceBoxContentResponse` returns box content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    inventoryDetail: (boxId: string, params: RequestParams = {}) =>
      this.http.request<ServiceBoxContentResponse, ResterrErrResponse>({
        path: `/sdk/inventory/${boxId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, inventory
     * @name InventoryOpenCreate
     * @summary show box contents
     * @request POST:/sdk/inventory/{boxID}/open
     * @response `200` `ServiceBoxOpenResponse` returns box content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    inventoryOpenCreate: (boxId: string, params: RequestParams = {}) =>
      this.http.request<ServiceBoxOpenResponse, ResterrErrResponse>({
        path: `/sdk/inventory/${boxId}/open`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags payments
     * @name PricesList
     * @summary get payment items with invoice URLs
     * @request GET:/sdk/prices
     * @response `200` `PaymentsResponse` OK
     */
    pricesList: (params: RequestParams = {}) =>
      this.http.request<PaymentsResponse, any>({
        path: `/sdk/prices`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags api, inventory
     * @name ShopChargeGsCreate
     * @summary show box contents
     * @request POST:/sdk/shop/charge_gs
     * @response `200` `ServiceBoxContentResponse` returns box content
     * @response `500` `ResterrErrResponse` Internal server error
     */
    shopChargeGsCreate: (params: RequestParams = {}) =>
      this.http.request<ServiceBoxContentResponse, ResterrErrResponse>({
        path: `/sdk/shop/charge_gs`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, wagering
     * @name V1WagesClaimCreate
     * @summary Claim wage results
     * @request POST:/sdk/v1/wages/{id}/claim
     * @response `204` `void` No Content
     */
    v1WagesClaimCreate: (id: string, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/sdk/v1/wages/${id}/claim`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, wagering
     * @name V1WagesList
     * @summary Get available wages for current game
     * @request GET:/sdk/v1/wages
     * @response `200` `WageringWagesResponse` OK
     */
    v1WagesList: (params: RequestParams = {}) =>
      this.http.request<WageringWagesResponse, any>({
        path: `/sdk/v1/wages`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, wagering
     * @name V1WagesStartCreate
     * @summary Start wage
     * @request POST:/sdk/v1/wages/{id}/start
     * @response `204` `void` No Content
     */
    v1WagesStartCreate: (id: string, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/sdk/v1/wages/${id}/start`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags sdk, wagering
     * @name V1WagesUpdate
     * @summary update wage value from game backend
     * @request PUT:/sdk/v1/wages/{id}
     * @response `204` `void` No Content
     */
    v1WagesUpdate: (
      id: string,
      body: WageringUpdateWageValueRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/sdk/v1/wages/${id}`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),
  };
  v1 = {
    /**
     * No description
     *
     * @tags api, tasks
     * @name TasksMintCreate
     * @summary Get tasks list
     * @request POST:/v1/tasks/{taskID}/mint
     * @response `200` `void` OK
     * @response `403` `HttpErrorResponse` Not Claimable Yet
     * @response `404` `HttpErrorResponse` Task Not Found
     * @response `409` `HttpErrorResponse` Already Minted
     * @response `500` `HttpErrorResponse` Internal Server Error
     */
    tasksMintCreate: (taskId: string, params: RequestParams = {}) =>
      this.http.request<void, HttpErrorResponse>({
        path: `/v1/tasks/${taskId}/mint`,
        method: "POST",
        ...params,
      }),
  };
}
