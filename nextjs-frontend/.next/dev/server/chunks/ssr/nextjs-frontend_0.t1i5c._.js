module.exports = [
"[project]/nextjs-frontend/components/Feed.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Feed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function Feed({ videos, isLoadingMore = false, onLoadMore, hasMore = false }) {
    const sentinelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Intersection Observer for infinite scroll
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver((entries)=>{
            if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
                onLoadMore();
            }
        }, {
            threshold: 0.1
        });
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }
        return ()=>{
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, [
        hasMore,
        isLoadingMore,
        onLoadMore
    ]);
    // Format view count
    const formatViews = (views)=>{
        if (views > 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views > 1000) return `${(views / 1000).toFixed(1)}k`;
        return views;
    };
    // Format duration
    const formatDuration = (seconds)=>{
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "px-4 py-8 max-w-350 mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                children: videos.map((video)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: `/video/${video._id}`,
                        className: "group block",
                        "aria-label": `${video.title} by ${video.user.username} - ${formatViews(video.views)} views`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative aspect-9/16 rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.1)] group-hover:border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: video.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop',
                                    alt: video.title,
                                    className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                                    loading: "lazy"
                                }, void 0, false, {
                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/95 pointer-events-none"
                                }, void 0, false, {
                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                    lineNumber: 85,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-8 h-8 ml-1",
                                            fill: "currentColor",
                                            viewBox: "0 0 20 20",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                lineNumber: 90,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                            lineNumber: 89,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                        lineNumber: 88,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg",
                                    children: formatDuration(video.duration)
                                }, void 0, false, {
                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-0 left-0 w-full p-5 flex items-end gap-3 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-11 h-11 rounded-full border-2 border-white/20 shadow-xl object-cover bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm",
                                                    children: video.user.username?.charAt(0).toUpperCase() || '?'
                                                }, void 0, false, {
                                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"
                                                }, void 0, false, {
                                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                            lineNumber: 100,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-white font-bold text-sm leading-snug drop-shadow-lg mb-1.5 line-clamp-2",
                                                    children: video.title
                                                }, void 0, false, {
                                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                    lineNumber: 108,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between text-[11px] font-medium text-gray-300",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate pr-2",
                                                            children: video.user.username
                                                        }, void 0, false, {
                                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                            lineNumber: 112,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "flex items-center gap-1 shrink-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: "w-3.5 h-3.5 text-gray-400",
                                                                    fill: "none",
                                                                    viewBox: "0 0 24 24",
                                                                    stroke: "currentColor",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: 2,
                                                                            d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                                            lineNumber: 115,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: 2,
                                                                            d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                                            lineNumber: 116,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                                    lineNumber: 114,
                                                                    columnNumber: 23
                                                                }, this),
                                                                formatViews(video.views)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                            lineNumber: 113,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                                    lineNumber: 99,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this)
                    }, video._id, false, {
                        fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: sentinelRef,
                className: "h-4 mt-8"
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            isLoadingMore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center items-center py-8",
                role: "status",
                "aria-live": "polite",
                "aria-label": "Loading more videos",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 w-8 border-3 border-gray-600 border-t-white rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                        lineNumber: 140,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                    lineNumber: 139,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                lineNumber: 133,
                columnNumber: 9
            }, this),
            !hasMore && videos.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-8 text-gray-500",
                role: "status",
                "aria-live": "polite",
                "aria-label": "No more videos available",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "No more videos to load"
                }, void 0, false, {
                    fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                    lineNumber: 153,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/components/Feed.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/nextjs-frontend/components/Feed.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
}),
"[project]/nextjs-frontend/hooks/useFeed.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFeed",
    ()=>useFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const useFeed = (feedType = 'trending', initialLimit = 20)=>{
    const [videos, setVideos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [totalCount, setTotalCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [hasMore, setHasMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const debounceTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isLoadingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const fetchVideos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (pageNum = 1, reset = false)=>{
        // Prevent duplicate requests while loading
        if (isLoadingRef.current) {
            return;
        }
        try {
            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);
            // Get JWT token from localStorage
            const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
            const headers = {
                'Content-Type': 'application/json'
            };
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/videos/feed/${feedType}?page=${pageNum}&limit=${initialLimit}`, {
                headers
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication required for following feed');
                }
                throw new Error(`Failed to fetch ${feedType} feed`);
            }
            const data = await response.json();
            if (reset) {
                setVideos(data.data.videos);
            } else {
                setVideos((prev)=>[
                        ...prev,
                        ...data.data.videos
                    ]);
            }
            setPage(pageNum);
            setTotalCount(data.data.totalCount);
            setHasMore(data.data.hasMore);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feed';
            setError(errorMessage);
            setHasMore(false);
        } finally{
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, [
        feedType,
        initialLimit
    ]);
    const fetchMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        // Debounce subsequent requests to prevent rapid-fire calls
        debounceTimerRef.current = setTimeout(()=>{
            if (!isLoadingRef.current && hasMore) {
                fetchVideos(page + 1, false);
            }
        }, 300);
    }, [
        page,
        hasMore,
        fetchVideos
    ]);
    const resetFeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setVideos([]);
        setPage(1);
        setError(null);
        setHasMore(true);
        await fetchVideos(1, true);
    }, [
        fetchVideos
    ]);
    const retry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setError(null);
        await resetFeed();
    }, [
        resetFeed
    ]);
    // Auto-fetch on mount or when feedType changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        resetFeed();
        return ()=>{
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [
        feedType,
        resetFeed
    ]);
    return {
        videos,
        isLoading,
        error,
        hasMore,
        page,
        totalCount,
        fetchMore,
        resetFeed,
        retry
    };
};
}),
"[project]/nextjs-frontend/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$components$2f$Feed$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/components/Feed.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$hooks$2f$useFeed$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/nextjs-frontend/hooks/useFeed.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function Home() {
    const { isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [feedType, setFeedType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('trending');
    const [allVideos, setAllVideos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [isLoadingMore, setIsLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { videos, isLoading, error, hasMore, fetchMore, retry } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$hooks$2f$useFeed$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFeed"])(feedType, 20);
    // Sync videos when feed changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setAllVideos(videos);
    }, [
        videos,
        feedType
    ]);
    const handleFeedTypeChange = (newType)=>{
        setFeedType(newType);
        setAllVideos([]);
        setPage(1);
    };
    const handleLoadMore = async ()=>{
        if (!isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            await fetchMore();
            setIsLoadingMore(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-7xl mx-auto px-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-4 mb-8 justify-center items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleFeedTypeChange('trending'),
                        "aria-label": "Show trending videos",
                        "aria-pressed": feedType === 'trending',
                        className: `px-6 py-2 rounded-full font-semibold transition-all ${feedType === 'trending' ? 'bg-black text-white border-2 border-white shadow-lg shadow-white/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`,
                        children: "🔥 Trending"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleFeedTypeChange('following'),
                        disabled: !isAuthenticated,
                        "aria-label": "Show videos from users you follow",
                        "aria-pressed": feedType === 'following',
                        className: `px-6 py-2 rounded-full font-semibold transition-all ${feedType === 'following' ? 'bg-black text-white border-2 border-white shadow-lg shadow-white/20' : isAuthenticated ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-900 text-gray-600 cursor-not-allowed'}`,
                        title: !isAuthenticated ? 'Sign in to view following feed' : '',
                        children: "👥 Following"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/nextjs-frontend/app/page.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-center",
                role: "alert",
                "aria-live": "polite",
                "aria-atomic": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-3",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    feedType === 'following' && !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mb-3",
                        children: "Sign in to view videos from users you follow"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 81,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: retry,
                        className: "px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors",
                        "aria-label": "Retry loading feed",
                        children: "Retry"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/nextjs-frontend/app/page.tsx",
                lineNumber: 73,
                columnNumber: 9
            }, this),
            !isLoading && allVideos.length === 0 && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400 text-lg mb-4",
                    children: feedType === 'trending' ? 'No videos yet. Check back soon!' : 'No videos from users you follow. Follow some users to see their content!'
                }, void 0, false, {
                    fileName: "[project]/nextjs-frontend/app/page.tsx",
                    lineNumber: 96,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/app/page.tsx",
                lineNumber: 95,
                columnNumber: 9
            }, this),
            allVideos.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$components$2f$Feed$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                videos: allVideos,
                isLoadingMore: isLoadingMore,
                onLoadMore: handleLoadMore,
                hasMore: hasMore
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/app/page.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this),
            isLoading && allVideos.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center items-center py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$nextjs$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-12 w-12 border-4 border-gray-600 border-t-white rounded-full",
                        role: "status",
                        "aria-label": "Loading videos"
                    }, void 0, false, {
                        fileName: "[project]/nextjs-frontend/app/page.tsx",
                        lineNumber: 113,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/nextjs-frontend/app/page.tsx",
                    lineNumber: 112,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/nextjs-frontend/app/page.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/nextjs-frontend/app/page.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=nextjs-frontend_0.t1i5c._.js.map