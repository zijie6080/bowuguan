import { EXHIBIT_META, HALLS } from "@/exhibits/meta";
import ExhibitCard from "@/components/ExhibitCard";
import ScoreBadge from "@/components/ScoreBadge";

const HALL_INTRO: Record<string, string> = {
  概率厅: "硬币、门与信封——概率最基本的规则,恰恰是直觉最先失守的地方。",
  统计厅: "数据不会说谎,但它非常擅长让你自己骗自己。",
  决策厅: "当你必须做决定的时候,数学有几句忠告。",
};
const HALL_NO: Record<string, string> = { 概率厅: "第一展厅", 统计厅: "第二展厅", 决策厅: "第三展厅" };

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:pt-16">
      <header className="relative text-center">
        <p className="font-display text-[11px] tracking-[0.55em] text-brass">MUSEUM OF COUNTERINTUITION</p>
        <h1 className="mt-4 font-display text-5xl font-bold text-cream sm:text-7xl">
          反直觉<span className="text-brass-2">博物馆</span>
        </h1>
        <hr className="brass-rule mx-auto my-7 max-w-md" />
        <p className="mx-auto max-w-xl leading-loose text-dim">
          馆内 15 件藏品,件件让聪明人栽过跟头。参观规则只有一条:
          <br className="hidden sm:block" />
          <span className="text-cream">先押上你的直觉,再亲手跑模拟</span>——让数据当面告诉你,你错在哪。
        </p>
        <div className="mt-9"><ScoreBadge /></div>
        <p className="mt-5 font-display text-xs tracking-[0.3em] text-dim/80">直觉是最熟练的骗子 · 数据是最诚实的讲解员</p>
      </header>

      {HALLS.map((hall) => (
        <section key={hall} className="mt-20">
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="brass-plate font-display text-sm">{HALL_NO[hall]} · {hall}</span>
            <span className="text-sm text-dim">{HALL_INTRO[hall]}</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EXHIBIT_META.filter((e) => e.hall === hall).map((e) => (
              <ExhibitCard key={e.id} def={e} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-24 text-center">
        <hr className="brass-rule mx-auto mb-6 max-w-xs" />
        <p className="text-xs leading-relaxed text-dim">
          本馆所有模拟均在你的浏览器里实时运算,不预存结果,不做手脚。
          <br />
          模拟逻辑经单元测试与解析理论值逐一校验。
        </p>
      </footer>
    </main>
  );
}
