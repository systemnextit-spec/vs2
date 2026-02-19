export const TrafficChartSection = (): JSX.Element => {
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
    <div className="relative w-[754px] h-[273px] bg-white rounded-lg overflow-hidden">
      <div className="inline-flex h-[196px] items-center gap-2 absolute top-[13px] left-2.5">
        <div className="relative w-fit ml-[-39.50px] mr-[-31.50px] rotate-[-90.00deg] [font-family:'DM_Sans',Helvetica] font-normal text-black-4 text-xs text-center tracking-[0] leading-[normal]">
          Units of measure
        </div>

        <img
          className="relative self-stretch w-px mt-[-0.35px] mb-[-0.35px] mr-[-0.65px]"
          alt="Divider"
          src="https://c.animaapp.com/9ijsMV30/img/divider.svg"
        />
      </div>

      <div className="flex w-[689px] items-end justify-between absolute top-4 left-[47px]">
        {chartData.map((data, index) => (
          <div
            key={index}
            className="inline-flex flex-col items-center justify-center gap-1 relative flex-[0_0_auto]"
          >
            <div className="inline-flex items-end gap-1 relative flex-[0_0_auto]">
              <div className="relative w-6 h-[82px] bg-[linear-gradient(180deg,rgba(56,189,248,1)_0%,rgba(30,144,255,1)_100%)]">
                <div className="text-center absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                  {data.mobile}
                </div>
              </div>

              <div className="relative w-6 h-[102px] bg-[linear-gradient(180deg,rgba(255,159,28,1)_0%,rgba(255,106,0,1)_100%)]">
                <div className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                  {data.tab}
                </div>
              </div>

              <div
                className="relative w-6 bg-[linear-gradient(180deg,rgba(160,139,255,1)_0%,rgba(89,67,255,1)_100%)]"
                style={{ height: `${data.desktopHeight}px` }}
              >
                <div className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                  {data.desktop}
                </div>
              </div>
            </div>

            <div className="relative w-fit [font-family:'DM_Sans',Helvetica] font-normal text-black-4 text-xs tracking-[0] leading-[normal]">
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
            <div className={`relative w-5 h-5 rounded-[22px] ${item.color}`} />

            <div className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-black-4 text-xs text-center tracking-[0] leading-[normal]">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
