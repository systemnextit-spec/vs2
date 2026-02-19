export const VisitorStatsSection = (): JSX.Element => {
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

  return (
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
              className="relative self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-base tracking-[0] leading-[normal]"
              style={{ color: stat.titleColor }}
            >
              {stat.title}
            </h3>

            <p className="relative self-stretch [font-family:'Poppins',Helvetica] font-normal text-black text-xs tracking-[0] leading-[normal]">
              {stat.subtitle}
            </p>
          </div>

          <img
            className="absolute top-[calc(50.00%_-_18px)] left-4 w-[38px] h-[38px] aspect-[1]"
            alt={stat.iconAlt}
            src={stat.icon}
          />

          <div className="absolute top-[calc(50.00%_-_18px)] left-[310px] [font-family:'Poppins',Helvetica] font-medium text-black text-2xl tracking-[0] leading-[normal]">
            {stat.value}
          </div>
        </article>
      ))}
    </section>
  );
};
