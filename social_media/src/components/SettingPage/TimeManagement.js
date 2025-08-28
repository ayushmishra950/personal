import React, { useMemo } from "react";
import PageShell from "./PageShell";
import { gql, useQuery } from "@apollo/client";
import { GetTokenFromCookie } from "../getToken/GetToken";

const ACTIVITY_LOGS_QUERY = gql`
  query ActivityLogs($userId: ID!) {
    activityLogs(userId: $userId) {
      date
      totalMinutes
    }
  }
`;

export default function TimeManagement() {
  const decoded = GetTokenFromCookie();
  const userId = decoded?.id;

  const { data, loading, error } = useQuery(ACTIVITY_LOGS_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

  const { chartData, maxVal } = useMemo(() => {
    const logs = data?.activityLogs || [];

    const getDateString = (d = new Date()) => d.toISOString().split("T")[0];
    const daysBack = 7;
    const last7Days = Array.from({ length: daysBack }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysBack - 1 - i)); // oldest -> newest
      return getDateString(d);
    });

    const minutesByDate = logs.reduce((map, l) => {
      if (l?.date) map.set(l.date, Number(l.totalMinutes) || 0);
      return map;
    }, new Map());

    const dataPoints = last7Days.map((dateStr) => {
      const minutes = minutesByDate.get(dateStr) || 0;
      const hours = Number((minutes / 60).toFixed(1));
      const day = new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
      return { day, value: hours };
    });

    const max = Math.max(1, ...dataPoints.map((d) => d.value));
    return { chartData: dataPoints, maxVal: max };
  }, [data]);

  return (
    <PageShell title="Time Management">
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
          Last 7 Days Activity (Hours)
        </h3>
        <div className="h-48 sm:h-64 flex items-end justify-center space-x-2 sm:space-x-6 px-2 sm:px-4 overflow-hidden">
          {(loading ? Array.from({ length: 7 }, () => ({ day: "", value: 0 })) : chartData).map((bar, index) => {
              const heightPercentage = maxVal ? (bar.value / maxVal) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1 max-w-16">
                  <div
                    className={`bg-[#B65FCF] w-8 sm:w-12 rounded-t-lg shadow-sm ${loading ? "opacity-50" : "hover:opacity-80"} transition-all duration-700 ease-out`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium truncate">
                    {bar.day}
                  </span>
                  <span className="text-xs text-gray-400 truncate">{bar.value}</span>
                </div>
              );
            })}
          </div>
        {/* )} */}
      </div>
    </PageShell>
  );
}