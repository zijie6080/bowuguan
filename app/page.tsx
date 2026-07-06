import { EXHIBIT_META, HALLS } from "@/exhibits/meta";
import ExhibitCard from "@/components/ExhibitCard";
import ScoreBadge from "@/components/ScoreBadge";

const HALL_INTRO: Record<string, string> = {
  概率厅: "硬币、门与信封——概率最基本的规则,恰恰是直觉最先失守的地方。",
  统计厅: "数据不会说谎,但它非常擅长让你自己骗自己。",
  决策厅: "当你必须做决定的时候,数学有几句忠告。",
};

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-14">
      <header className="text-center">
        <p className="font-display text-sm tracking-[0.5em] text-gold">MUSEUM OF COUNTERINTUITION</p>
        <h1 className="mt-3 font-display text-4xl text-cream sm:text-6xl">反直觉博物馆</h1>
        <div className="gold-rule mx-auto my-6 max-w-md" />
        <p className="mx-auto max-w-xl leading-relaxed text-dim">
          这里的每件展品,都曾让无数聪明人栽过跟头。
          参观规则只有一条:<span className="text-cream">先押上你的直觉,再亲手跑模拟</span>——让数据当面告诉你,你错在哪。
        </p>
        <div className="mt-8"><ScoreBadge /></div>
      </header>

      {HALLS.map((hall) => (
        <section key={hall} className="mt-16">
          <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="font-display text-2xl text-gold-2">{hall}</h2>
            <span className="text-sm text-dim">{HALL_INTRO[hall]}</span>
          </div>
          <div className="gold-rule mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXHIBIT_META.filter((e) => e.hall === hall).map((e) => (
              <ExhibitCard key={e.id} def={e} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-20 text-center text-xs text-dim">
        本馆所有模拟均在你的浏览器里实时运算 · 模拟逻辑经单元测试与理论值校验
      </footer>
    </main>
  );
}
