import styles from "./Career.module.css";

type CareerItem = {
  title: string;
  period: string;
  keyword: string;
  body: string[];
};

const CAREERS: CareerItem[] = [
  {
    title: "Explore / Canada",
    period: "2015 - 2016",
    keyword: "新しい環境で、自分から動く",
    body: [
      "ワーキングホリデーでカナダ・トロントへ。知り合いのいない環境で、住む場所や仕事を自分で探しました。",
      "この経験から、新しい環境でもまず自分から動くようになりました。",
    ],
  },
  {
    title: "Hospitality",
    period: "2018 - 2020",
    keyword: "人が過ごす時間を考える",
    body: [
      "沖縄のホテル・カフェで、接客や運営に携わりました。",
      "お客様がどんな目的で訪れ、どうすればより良い時間を過ごせるのかを考えながら働いていました。",
    ],
  },
  {
    title: "Community & Place",
    period: "2020 - 2022",
    keyword: "人と人がつながる環境をつくる",
    body: [
      "コミュニティマネージャーとして、コワーキングスペースやシェアハウス、プログラミングスクールなどの運営に関わりました。",
      "利用する人の強みや関心を見ながら、イベントを企画したり、人同士をつないだりしていました。そこで現役エンジニアの方々と関わったことをきっかけに、Webエンジニアに興味を持ちました。",
    ],
  },
  {
    title: "Software & Product",
    period: "2022 - Present",
    keyword: "テクノロジーで体験をつくる",
    body: [
      "Webエンジニアとして、飲食・小売、旅行、AI SaaSなどのプロダクト開発を経験。UI改善や仕様検討、分析、業務改善にも関わってきました。",
      "開発を重ねる中で、実装だけでなく、何をつくるかや、使う人の体験について考えることが増えました。",
    ],
  },
  {
    title: "Experience",
    period: "Next",
    keyword: "リアルとデジタルをつなぐ",
    body: [
      "ホテルやコミュニティ運営、Webプロダクト開発を経験する中で、リアルな場所とデジタルの両方に関心を持つようになりました。",
      "これからは、デジタルだけでなくリアルな場所も含めて、体験づくりに関わっていきたいと考えています。現在は個人で、音声ジャーナリングサービス「Focus on Dot」を企画・開発しています。",
    ],
  },
];

export default function Career() {
  return (
    <section className={styles.section} aria-labelledby="career-title" id="career">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2 className={styles.eyebrow} id="career-title">
            CAREER ｜ これまでの流れ
          </h2>
          <p className={styles.lead}>
            人や場所に関わる仕事と、
            <br />
            プロダクト開発を経験してきました。
          </p>
        </div>

        <ol className={styles.timeline}>
          {CAREERS.map((item) => (
            <li className={styles.item} key={item.title}>
              <div className={styles.meta}>
                <span className={styles.period}>{item.period}</span>
                <span className={styles.marker} aria-hidden="true" />
              </div>

              <div className={styles.content}>
                <p className={styles.keyword}>{item.keyword}</p>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <div className={styles.body}>
                  {item.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
