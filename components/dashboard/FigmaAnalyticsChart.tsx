import React from "react";

/**
 * Main App Component
 * Displays a combined view of Visitor Statistics and Traffic Charts.
 */
const FigmaAnalyticsChart = () => {
  const statsData = [
    {
      id: "online-now",
      title: "Online Now",
      subtitle: "Active visitors on site",
      value: "35",
      icon: "https://c.animaapp.com/9ijsMV30/img/fluent-live-24-regular.svg",
      iconAlt: "Fluent live",
      titleColor: "#008cff",
      bgGradient:
        "bg-[linear-gradient(0deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.95)_100%),linear-gradient(0deg,rgba(136,201,255,1)_0%,rgba(136,201,255,1)_100%)]",
      decorativeCircleBg: "bg-[#008cff36]",
    },
    {
      id: "today-visitors",
      title: "Today visitors",
      subtitle: "Last 7 days: 4",
      value: "35",
      icon: "https://c.animaapp.com/9ijsMV30/img/fluent-people-community-20-regular.svg",
      iconAlt: "Fluent people",
      titleColor: "#ff5500",
      bgGradient:
        "bg-[linear-gradient(0deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.95)_100%),linear-gradient(0deg,rgba(255,195,136,1)_0%,rgba(255,195,136,1)_100%)]",
      decorativeCircleBg: "bg-[#ff7d0042]",
    },
    {
      id: "total-visitors",
      title: "Total visitors",
      subtitle: "15 page view",
      value: "35",
      icon: "https://c.animaapp.com/9ijsMV30/img/streamline-plump-web.svg",
      iconAlt: "Streamline plump web",
      titleColor: "#3f34be",
      bgGradient:
        "bg-[linear-gradient(0deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.95)_100%),linear-gradient(0deg,rgba(162,136,255,1)_0%,rgba(162,136,255,1)_100%)]",
      decorativeCircleBg:
        "bg-[linear-gradient(180deg,rgba(55,0,251,0.21)_0%,rgba(33,0,149,0.21)_100%)]",
    },
  ];

  const chartData = [
    { date: "Jan 25", mobile: 30, tab: 35, desktop: 40, desktopHeight: 125 },
    { date: "Jan 26", mobile: 30, tab: 35, desktop: 55, desktopHeight: 146 },
    { date: "Jan 27", mobile: 30, tab: 35, desktop: 70, desktopHeight: 193 },
    { date: "Jan 28", mobile: 30, tab: 35, desktop: 55, desktopHeight: 148 },
    { date: "Jan 29", mobile: 30, tab: 35, desktop: 40, desktopHeight: 125 },
    { date: "Jan 30", mobile: 30, tab: 35, desktop: 60, desktopHeight: 163 },
    { date: "Jan 31", mobile: 30, tab: 35, desktop: 40, desktopHeight: 125 },
  ];

  const legendItems = [
    {
      color:
        "bg-[linear-gradient(90deg,rgba(56,189,248,1)_0%,rgba(30,144,255,1)_100%)]",
      label: "Mobile View",
    },
    {
      color:
        "bg-[linear-gradient(180deg,rgba(255,106,0,1)_0%,rgba(255,159,28,1)_100%)]",
      label: "Tab View",
    },
    {
      color:
        "bg-[linear-gradient(180deg,rgba(160,139,255,1)_0%,rgba(89,67,255,1)_100%)]",
      label: "Desktop View",
    },
  ];

  return (
    <div className="">
      <div className="inline-flex items-center gap-5 relative bg-white p-6 rounded-2xl shadow-xl">
        {/* Visitor Stats Section */}
        <section className="inline-flex flex-col h-[273px] items-start justify-center gap-[15px] relative flex-[0_0_auto]">
          {statsData.map((stat) => (
            <article
              key={stat.id}
              className={`relative flex-1 w-[372px] grow rounded-lg overflow-hidden shadow-[0px_2px_4px_#0000000d] ${stat.bgGradient}`}
            >
              <div
                className={`${stat.decorativeCircleBg} absolute top-[-83px] left-[237px] w-[198px] h-[198px] rounded-[99px]`}
              />

              <div className="flex flex-col w-[125px] items-start absolute top-[calc(50.00%_-_20px)] left-[70px]">
                <h3
                  className="relative self-stretch mt-[-1.00px] font-medium text-base tracking-[0] leading-[normal]"
                  style={{
                    color: stat.titleColor,
                    fontFamily: "Poppins, Helvetica, sans-serif",
                  }}
                >
                  {stat.title}
                </h3>

                <p
                  className="relative self-stretch font-normal text-black text-xs tracking-[0] leading-[normal]"
                  style={{ fontFamily: "Poppins, Helvetica, sans-serif" }}
                >
                  {stat.subtitle}
                </p>
              </div>

              <img
                className="absolute top-[calc(50.00%_-_18px)] left-4 w-[38px] h-[38px] aspect-[1]"
                alt={stat.iconAlt}
                src={stat.icon}
              />

              <div
                className="absolute top-[calc(50.00%_-_18px)] left-[310px] font-medium text-black text-2xl tracking-[0] leading-[normal]"
                style={{ fontFamily: "Poppins, Helvetica, sans-serif" }}
              >
                {stat.value}
              </div>
            </article>
          ))}
        </section>

        {/* Traffic Chart Section */}
        <div className="relative w-[999px] h-[273px] bg-white rounded-lg overflow-hidden border border-slate-100">
          <div className="inline-flex h-[196px] items-center gap-2 absolute top-[13px] left-2.5">
            <div
              className="relative w-fit ml-[-39.50px] mr-[-31.50px] rotate-[-90.00deg] font-normal text-slate-400 text-xs text-center tracking-[0] leading-[normal]"
              style={{ fontFamily: "DM Sans, Helvetica, sans-serif" }}
            >
              Units of measure
            </div>

            <div className="relative self-stretch w-px bg-slate-200 mt-[-0.35px] mb-[-0.35px] mr-[-0.65px]" />
          </div>

          <div className="flex w-[689px] items-end justify-between absolute top-4 left-[47px]">
            {chartData.map((data, index) => (
              <div
                key={index}
                className="inline-flex flex-col items-center justify-center gap-1 relative flex-[0_0_auto]"
              >
                <div className="inline-flex items-end gap-1 relative flex-[0_0_auto]">
                  <div className="relative w-6 h-[82px] bg-[linear-gradient(180deg,rgba(56,189,248,1)_0%,rgba(30,144,255,1)_100%)] rounded-t-sm">
                    <div
                      className="text-center absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 font-semibold text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
                      style={{ fontFamily: "Lato, Helvetica, sans-serif" }}
                    >
                      {data.mobile}
                    </div>
                  </div>

                  <div className="relative w-6 h-[102px] bg-[linear-gradient(180deg,rgba(255,159,28,1)_0%,rgba(255,106,0,1)_100%)] rounded-t-sm">
                    <div
                      className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 font-semibold text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
                      style={{ fontFamily: "Lato, Helvetica, sans-serif" }}
                    >
                      {data.tab}
                    </div>
                  </div>

                  <div
                    className="relative w-6 bg-[linear-gradient(180deg,rgba(160,139,255,1)_0%,rgba(89,67,255,1)_100%)] rounded-t-sm"
                    style={{ height: `${data.desktopHeight}px` }}
                  >
                    <div
                      className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 font-semibold text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
                      style={{ fontFamily: "Lato, Helvetica, sans-serif" }}
                    >
                      {data.desktop}
                    </div>
                  </div>
                </div>

                <div
                  className="relative w-fit font-normal text-slate-400 text-[10px] tracking-[0] leading-[normal]"
                  style={{ fontFamily: "DM Sans, Helvetica, sans-serif" }}
                >
                  {data.date}
                </div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-12 absolute top-[238px] left-[calc(50.00%_-_192px)]">
            {legendItems.map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]"
              >
                <div
                  className={`relative w-4 h-4 rounded-full ${item.color}`}
                />

                <div
                  className="relative w-fit font-medium text-slate-500 text-[10px] text-center tracking-[0] leading-[normal]"
                  style={{ fontFamily: "DM Sans, Helvetica, sans-serif" }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaAnalyticsChart;