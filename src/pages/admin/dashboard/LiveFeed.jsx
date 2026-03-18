import { feedItems } from "./../../../data/feed";

const dotColorMap = {
  blue: "bg-feed-blue",
  yellow: "bg-feed-yellow",
  gray: "bg-feed-gray",
};

function FeedItem({ item, isLast }) {
  return (
    <div className="relative flex gap-3.5 3xl:gap-5 5xl:gap-7">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <div
          className={`h-3 w-3 3xl:h-4 3xl:w-4 5xl:h-5 5xl:w-5 rounded-full ${dotColorMap[item.dotColor]} mt-1 flex-shrink-0 ring-4 3xl:ring-[5px] ring-white`}
        />
        {/* Connecting line */}
        {!isLast && (
          <div className="w-0.5 3xl:w-[3px] flex-1 bg-slate-100 mt-1.5" />
        )}
      </div>

      {/* Content */}
      <div
        className={`pb-6 3xl:pb-8 5xl:pb-10 min-w-0 ${isLast ? "pb-0" : ""}`}
      >
        <h4 className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900 leading-snug">
          {item.title}
        </h4>
        <p className="mt-1 3xl:mt-1.5 text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-slate-500 leading-relaxed">
          {item.description}
        </p>
        <span className="mt-1.5 3xl:mt-2 inline-block text-[10px] 3xl:text-[12px] 5xl:text-[15px] font-bold tracking-[0.06em] text-slate-400 uppercase">
          {item.time}
        </span>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-5 sm:p-6 3xl:p-8 5xl:p-12 shadow-sm h-full flex flex-col">
      {/* Header */}
      <h3 className="text-[18px] sm:text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-brand-900 mb-5 3xl:mb-7 5xl:mb-10">
        Live Dispatch Feed
      </h3>

      {/* Feed list */}
      <div className="flex-1 space-y-0">
        {feedItems.map((item, index) => (
          <FeedItem
            key={item.id}
            item={item}
            isLast={index === feedItems.length - 1}
          />
        ))}
      </div>

      {/* View all link */}
      <div className="mt-5 3xl:mt-7 5xl:mt-10 pt-4 3xl:pt-5 5xl:pt-7 border-t border-slate-100">
        <button className="text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-bold tracking-[0.04em] text-brand-600 uppercase transition-colors hover:text-brand-700">
          View All Activity
        </button>
      </div>
    </div>
  );
}
