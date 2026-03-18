import { currentUser, currentDate } from "../../../data/user";
import { CalendarIcon, PlusIcon } from "../../../components/icons/index";

export default function Greeting() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left — greeting */}
      <div className="min-w-0">
        <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] 3xl:text-[40px] 5xl:text-[52px] font-bold text-brand-900 leading-tight">
          Good morning, {currentUser.firstName}
        </h1>
        <p className="mt-1 text-[14px] sm:text-[15px] 3xl:text-[18px] 5xl:text-[24px] text-slate-500">
          Here is the dispatch performance for {currentUser.siding} today.
        </p>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3 3xl:gap-4 5xl:gap-6 flex-shrink-0">
        {/* Date picker button */}
        <button className="flex items-center gap-2 3xl:gap-3 rounded-lg border border-border-subtle bg-card px-4 py-2.5 3xl:px-5 3xl:py-3 5xl:px-7 5xl:py-4 text-[13px] sm:text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <CalendarIcon className="text-slate-400 3xl:w-5 3xl:h-5 5xl:w-7 5xl:h-7" />
          <span className="whitespace-nowrap">{currentDate}</span>
        </button>

        {/* New Rake Offering button */}
        <button className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-brand-600 px-4 py-2.5 sm:px-5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] sm:text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.98]">
          <PlusIcon className="3xl:w-5 3xl:h-5 5xl:w-7 5xl:h-7" />
          <span className="whitespace-nowrap hidden xs:inline">
            New Rake Offering
          </span>
          <span className="xs:hidden">New Rake</span>
        </button>
      </div>
    </div>
  );
}
