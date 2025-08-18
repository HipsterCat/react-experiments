// import {
//   type JSX,
//   type ReactNode,
//   useLayoutEffect,
//   useMemo,
//   useState,
// } from "react";
// import { useLocation, useNavigate } from "react-router";

// import {
//   IconApp28,
//   IconCup28,
//   IconGame28,
//   IconSmile28,
//   IconWallet28,
// } from "../../components/svgIcons";
// import { useProfileData } from "@/features/profile/hooks/useProfileData";
// import { useEffectEvent } from "@/hooks/useEffectEvent";
// import { RoutePath } from "@/router";
// import { isMacOS } from "@/utils/common";
// import { isPresent } from "../../utils/isPresent";
// import { isVirtualKeyboardOpen } from "../../utils/isVirtualKeyboardOpen";
// import { getRootScroller, setRootScroller } from "../../utils/windowScroll";
// import { Avatar, Text } from "@telegram-apps/telegram-ui";
// import { useTranslation } from "../../hooks/useTranslation";
// import { Tabbar } from "./Tabbar";
// import {
//   type ScreenOptions,
//   type ScreenOptionsStackEntry,
//   TabbarContextProvider,
//   type TabbarContextType,
// } from "./TabbarContext";
// import { TabbarItem } from "./TabbarItem";
// import posthog from "posthog-js";


// // It's not precise because element can be focused but browser can suppress the virtual keyboard
// export function isVirtualKeyboardOpen(): boolean {
//   const { activeElement } = document;
//   return (
//     isMobile() &&
//     activeElement instanceof HTMLElement &&
//     (['INPUT', 'TEXTAREA'].includes(activeElement.tagName) ||
//       activeElement.contentEditable === 'true')
//   );
// }

// export function isMacOS(): boolean {
//   return window.Telegram?.WebApp?.platform === 'macos';
// }

// export function isWeb(): boolean {
//   return Boolean(window.Telegram?.WebApp?.platform?.startsWith('web'));
// }

// export function isMobile(): boolean {
//   return isAndroid() || isIOS();
// }

// export function isAndroid(): boolean {
//   return window.Telegram?.WebApp?.platform === 'android' || window.Telegram?.WebApp?.platform === 'android_x';
// }

// export function isIOS(): boolean {
//   return window.Telegram?.WebApp?.platform === 'ios';
// }

// enum TabbarTab {
//   HOME = "HOME",
//   EXPLORE = "EXPLORE",
//   LEADERBOARD = "LEADERBOARD",
//   WALLET = "WALLET",
//   PROFILE = "PROFILE",
//   ADMIN = "ADMIN",
// }

// type TabConfig = {
//   id: TabbarTab;
//   icon: ReactNode;
//   label: ReactNode;
//   onPress: VoidFunction;
//   disabled?: boolean;
// };

// const TABBAR_HIDDEN_PATH_PREFIXES: string[] = ["/onboarding"];
// const TABBAR_HIDDEN_PATH_POSTFIXES: string[] = ["/referral", "/leaders"];

// function getTabByPathname(path: string): TabbarTab | null {
//   if (TABBAR_HIDDEN_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
//     return null;
//   }

//   if (TABBAR_HIDDEN_PATH_POSTFIXES.some((postfix) => path.endsWith(postfix))) {
//     return null;
//   }

//   if (path.startsWith(RoutePath.GAMES_MAIN)) {
//     return TabbarTab.HOME;
//   }

//   if (path.startsWith(RoutePath.LEADERBOARD)) {
//     return TabbarTab.LEADERBOARD;
//   }

//   if (path.startsWith(RoutePath.WALLET)) {
//     return TabbarTab.WALLET;
//   }

//   if (path.startsWith(RoutePath.ADMIN)) {
//     return TabbarTab.ADMIN;
//   }

//   if (path.startsWith(RoutePath.EXPLORE)) {
//     return TabbarTab.EXPLORE;
//   }

//   if (path.startsWith("/profile")) {
//     return TabbarTab.PROFILE;
//   }

//   if (posthog.getFeatureFlag("landing") === "tasks") {
//     return TabbarTab.WALLET;
//   }
//   return TabbarTab.HOME;
// }

// export function TabbarProvider({
//   children,
// }: {
//   children: ReactNode;
// }): JSX.Element {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const { pathname } = useLocation();

//   const { profile } = useProfileData();

//   const activeTab = useMemo(() => getTabByPathname(pathname), [pathname]);
//   const [isTabbarEnabled, setIsTabbarEnabled] = useState(true);
//   const [visible, _] = useState<boolean>(true);
//   const [visibilityBlockers, setVisibilityBlockers] = useState<{
//     keyboard: boolean;
//     mainButton: boolean;
//   }>(() => ({
//     keyboard: isVirtualKeyboardOpen(),
//     mainButton:
//       window.Telegram?.WebApp?.MainButton.isVisible ||
//       window.Telegram?.WebApp?.SecondaryButton.isVisible,
//   }));

//   const [screenOptionsStack, setScreenOptionsStack] = useState<
//     ScreenOptionsStackEntry[]
//   >([]);

//   const pushScreenOptions = useEffectEvent((options: ScreenOptions) => {
//     const id = Math.random().toString(36);
//     setScreenOptionsStack((prev) => [...prev, { id, options }]);

//     return () => {
//       setScreenOptionsStack((prev) =>
//         prev.filter((screen) => screen.id !== id)
//       );
//     };
//   });

//   const scrollCurrentTabToTop = () => {
//     getRootScroller().scrollTo({
//       top: 0,
//       behavior: "instant",
//     });
//   };

//   const resolvedVisible =
//     visible &&
//     Object.values(visibilityBlockers).every((blocker) => !blocker) &&
//     screenOptionsStack.at(-1)?.options?.tabbar !== false;

//   const backdropBackground =
//     activeTab === TabbarTab.EXPLORE || activeTab === TabbarTab.LEADERBOARD;

//   const cwTabs: TabConfig[] = [
//     {
//       id: TabbarTab.HOME,
//       icon: <IconGame28 />,
//       label: t("navigation.home"),
//       onPress: () => {
//         const targetPath = RoutePath.GAMES_MAIN;
//         if (pathname === targetPath) {
//           scrollCurrentTabToTop();
//         } else {
//           navigate(targetPath);
//         }
//       },
//     },
//     // {
//     //   id: TabbarTab.EXPLORE,
//     //   icon: <IconApp28 />,
//     //   label: t("navigation.explore"),
//     //   onPress: () => {
//     //     const targetPath = RoutePath.EXPLORE;
//     //     if (pathname === targetPath) {
//     //       scrollCurrentTabToTop();
//     //     } else {
//     //       navigate(targetPath);
//     //     }
//     //   },
//     // },
//     {
//       id: TabbarTab.LEADERBOARD,
//       icon: <IconCup28 />,
//       label: t("navigation.leaderboard"),
//       onPress: () => {
//         const targetPath = RoutePath.LEADERBOARD;
//         navigate(targetPath);
//       },
//     },
//     {
//       id: TabbarTab.WALLET,
//       icon: <IconWallet28 />,
//       label: t("navigation.wallet"),
//       onPress: () => {
//         const targetPath = RoutePath.WALLET;
//         if (pathname === targetPath) {
//           scrollCurrentTabToTop();
//         } else {
//           navigate(targetPath);
//         }
//       },
//     },
//     {
//       id: TabbarTab.PROFILE,
//       icon: profile ? (
//         <div className="flex items-center justify-center flex-shrink-0">
//           <Avatar
//             style={{
//               boxSizing: "border-box",
//               minWidth: "unset !important",
//               width: 28,
//               height: 28,
//             }}
//             src={profile.avatar}
//           >
//             <Text
//               style={{
//                 fontWeight: 700,
//                 fontSize: "13px",
//                 lineHeight: "16px",
//                 color: "rgba(0, 122, 255, 1)",
//                 textAlign: "center",
//               }}
//             >
//               {profile.user_name
//                 ? profile.user_name.substring(0, 2)
//                 : `${profile.first_name?.[0] ?? ""}${
//                     profile.last_name?.[0] ?? ""
//                   }`}
//             </Text>
//           </Avatar>
//         </div>
//       ) : (
//         <div style={{ width: 28, height: 28 }} />
//       ),
//       label: t("navigation.profile"),
//       onPress: () => {
//         const targetPath = "/profile";
//         if (pathname === targetPath) {
//           scrollCurrentTabToTop();
//         } else {
//           navigate(targetPath);
//         }
//       },
//     },
//     profile?.is_admin
//       ? {
//           id: TabbarTab.ADMIN,
//           icon: <IconSmile28 />,
//           label: t("navigation.admin"),
//           onPress: () => {
//             const targetPath = RoutePath.ADMIN;
//             if (pathname === targetPath) {
//               scrollCurrentTabToTop();
//             } else {
//               navigate(targetPath);
//             }
//           },
//         }
//       : null,
//   ].filter(isPresent);

//   useLayoutEffect(() => {
//     document.documentElement.classList.toggle(
//       "tabbarScrollLayout",
//       isTabbarEnabled
//     );
//     setRootScroller(
//       isTabbarEnabled ? document.getElementById("root") : undefined
//     );
//   }, [isTabbarEnabled]);

//   const updateVisibilityBlocker = useEffectEvent(
//     (key: keyof typeof visibilityBlockers, value: boolean) => {
//       setVisibilityBlockers((prev) => {
//         if (value === prev[key]) return prev;
//         return { ...prev, [key]: value };
//       });
//     }
//   );

//   const updateKeyboardStatus = useEffectEvent(() => {
//     updateVisibilityBlocker("keyboard", isVirtualKeyboardOpen());
//   });

//   useLayoutEffect(() => {
//     // update keyboard status in a loop, the focusin/focusout events are not reliable in Telegram
//     const intervalId = setInterval(updateKeyboardStatus, 50);
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [updateKeyboardStatus]);

//   const setMainButtonVisibility = useEffectEvent((visible: boolean) => {
//     if (visible) {
//       updateVisibilityBlocker("mainButton", true);
//     } else {
//       // Wait some time before the MainButton hide animation starts,
//       // so that the Tabbar appear animation is not abrupt and blends nicely with the MainButton.
//       // The timeout value is not exact, it is empirically derived.
//       setTimeout(() => {
//         updateVisibilityBlocker("mainButton", false);
//       }, 80);
//     }
//   });

//   const tabbarContext = useMemo<TabbarContextType>(() => {
//     return {
//       setMainButtonVisibility,
//       pushScreenOptions,
//       isTabbarEnabled,
//       setIsTabbarEnabled,
//     };
//   }, [setMainButtonVisibility, pushScreenOptions, isTabbarEnabled]);

//   const { tasks } = useProfileData();
//   // todo проблема переход на /games скрывает бар
//   return (
//     <TabbarContextProvider value={tabbarContext}>
//       {children}
//       {(isTabbarEnabled || activeTab === "HOME") && (
//         <Tabbar
//           visible={resolvedVisible && activeTab !== null}
//           backdrop={backdropBackground}
//           skipHideAnimation={isMacOS()}
//         >
//           {cwTabs.map((tab) => {
//             if (tab.disabled) {
//               return null;
//             }
//             let badgeCount = 0;
//             if (tab.id === TabbarTab.WALLET) {
//               const claimableTasks = tasks.filter(
//                 (task) => task.status === "claimable"
//               );
//               badgeCount = claimableTasks.length;
//             }

//             return (
//               <TabbarItem
//                 key={tab.id}
//                 icon={tab.icon}
//                 active={activeTab === tab.id}
//                 backdrop={backdropBackground}
//                 badgeCount={badgeCount}
//                 onClick={() => {
//                   tab.onPress();
//                 }}
//               >
//                 {tab.label}
//               </TabbarItem>
//             );
//           })}
//         </Tabbar>
//       )}
//     </TabbarContextProvider>
//   );
// }
