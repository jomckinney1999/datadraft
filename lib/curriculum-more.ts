/**
 * The second and third units of Statistics, Visualization, Git and R
 * (2026-10-05). Each course was one three-lesson unit plus its final, four
 * lessons in all; these take each to ten. They sit between the course's
 * first unit and its final (see MODULES in lib/curriculum.ts).
 *
 * Same shape as every other lesson: a walk-in (`brief.steps`), a card, a
 * film card, then plays. Live where a runtime exists: Python for Statistics
 * (Pyodide, graded on what it prints), real R for R (WebR; run the keys with
 * `node scripts/check-r-keys.mjs`, since the verifier can't load WebR), and
 * the Viz Builder for Visualization (`viz`, lib/viz.ts). Git stays judgment
 * and fill-the-command: there's nothing to run in a browser that would teach
 * it better than reading the command.
 */

import type { Exercise, FillExercise, MCExercise, Unit } from "./curriculum";
import { emptySpec, type VizSpec } from "./viz";

const mc = (prompt: string, options: string[], answer: number, explain: string, code?: string): MCExercise =>
  code ? { type: "mc", prompt, code, options, answer, explain } : { type: "mc", prompt, options, answer, explain };

const fill = (prompt: string, parts: (string | null)[], bank: string[], answer: string[], explain: string): FillExercise => ({
  type: "fill",
  prompt,
  parts,
  bank,
  answer,
  explain,
});

const py = (prompt: string, starter: string, expected: string, hint: string, explain: string): Exercise => ({
  type: "code",
  lang: "python",
  prompt,
  starter,
  expected,
  hint,
  explain,
});

const r = (prompt: string, starter: string, expected: string, hint: string, explain: string): Exercise => ({
  type: "code",
  lang: "r",
  prompt,
  starter,
  expected,
  hint,
  explain,
});

const viz = (prompt: string, expected: Partial<VizSpec>, hint: string, explain: string): Exercise => ({
  type: "viz",
  prompt,
  expected: { ...emptySpec(expected.source), ...expected },
  hint,
  explain,
});

/** Ten weeks of two receivers with the same average and very different weeks. */
const TWO_WRS = `import pandas as pd

weeks = pd.DataFrame({
    "steady": [14, 15, 13, 16, 14, 15, 14, 16, 13, 14],
    "boom":   [2, 31, 4, 28, 3, 30, 1, 27, 5, 9],
})
`;

const R_WEEKLY = `suppressMessages(library(dplyr))

games <- data.frame(
  player = c("Allen", "Allen", "Allen", "Hurts", "Hurts", "Hurts", "Henry", "Henry"),
  position = c("QB", "QB", "QB", "QB", "QB", "QB", "RB", "RB"),
  week = c(1, 2, 3, 1, 2, 3, 1, 2),
  points = c(31.2, 9.8, 30.9, 16.4, 23.8, 10.9, 10.6, 16.6)
)
`;

export const STATS_MORE_UNIT_IDS = ["st-spread", "st-relate"] as const;
export const VIZ_MORE_UNIT_IDS = ["vz-build", "vz-story"] as const;
export const GIT_MORE_UNIT_IDS = ["gt-history", "gt-team"] as const;
export const R_MORE_UNIT_IDS = ["r-wrangle", "r-report"] as const;

// ── Statistics ─────────────────────────────────────────────────────

const STATS: Unit[] = [
  {
    id: "st-spread",
    number: 31,
    title: "Spread and Shape",
    drive: "8th Drive · 2nd & Long",
    description: "Same average, different player: the numbers that describe how much the weeks move.",
    skills: ["Standard deviation", "Percentiles", "IQR", "z-scores"],
    status: "live",
    lessons: [
      {
        id: "st-spread-l1",
        title: "Floor and Ceiling",
        blurb: "Two players with the same average can be different bets.",
        brief: {
          goal: "Measure how far a player's weeks wander from his own average.",
          steps: [
            {
              title: "Same average, different Sunday",
              body: "One receiver scores 14 or 15 almost every week. Another scores 2, then 31, then 4. Both average about 14. You'd start them in very different matchups.",
            },
            {
              title: "Spread is its own number",
              body: "Standard deviation measures how far a typical week lands from the player's own average. Small means steady. Big means boom or bust.",
              note: "It's in the same units as the data: points, here.",
            },
          ],
          setup: "The average says where a player sits. Standard deviation says how much he moves around it. Report both.",
        },
        intro: {
          title: "Standard deviation, in one picture",
          text: "Take each week's distance from the average, square it, average those, take the square root. You'll never do it by hand: .std() in pandas, STDEV in Excel, sd() in R.",
          code: "steady: 14 15 13 16 14   → std ≈ 1\nboom:    2 31  4 28  3   → std ≈ 14",
        },
        film: [
          {
            title: "Which one do you want?",
            text: "Favoured in your matchup? Take the steady one: you just need his floor. Big underdog? Take the volatile one: you need his ceiling.",
          },
        ],
        exercises: [
          mc(
            "Two players both average 15 points. Player A's standard deviation is 3, Player B's is 11. You're a big underdog this week. Who do you start?",
            ["Player A, he's safer", "Player B, you need the ceiling", "It doesn't matter, the averages match", "Neither, sit them both"],
            1,
            "An underdog needs a big week to win, and only the volatile player has a real chance of one.",
          ),
          py(
            "Real pandas. Print the standard deviation of each receiver's weeks, rounded to one decimal.",
            `${TWO_WRS}\n# print the std of both columns, rounded to 1 decimal\n`,
            `${TWO_WRS}\nprint(weeks.std().round(1))`,
            "weeks.std() gives one value per column. Chain .round(1) and print it.",
            "Same average, and one spread is more than ten times the other. That gap is the whole scouting report.",
          ),
          fill(
            "Show the average and the spread side by side.",
            ['summary = weeks.agg(["', null, '", "', null, '"])'],
            ["mean", "std", "sum", "max"],
            ["mean", "std"],
            "Average and standard deviation together: the centre and how much it wobbles.",
          ),
          mc(
            "A player's standard deviation is 0. What do you know?",
            ["He scored 0 every week", "He scored the same number every week", "He never played", "The calculation failed"],
            1,
            "Zero spread means no week differed from the average, so every week was the same.",
          ),
        ],
      },
      {
        id: "st-spread-l2",
        title: "Percentiles and the Box",
        blurb: "Where does a week rank among all the weeks?",
        brief: {
          goal: "Read percentiles and the interquartile range, and the box plot built from them.",
          steps: [
            {
              title: "Line up every week",
              body: "Sort a season's weeks from worst to best. The 25th percentile is a quarter of the way up. The 75th is three quarters. The median sits at 50.",
            },
            {
              title: "The middle half",
              body: "The gap between the 25th and 75th percentiles is the interquartile range. It's the spread of an ordinary week, and one monster game barely moves it.",
              note: "A box plot draws exactly this: the box is the middle half, the line is the median.",
            },
          ],
          setup: "Percentiles rank a value against the rest. The IQR is the middle half's spread, and it ignores outliers on purpose.",
        },
        intro: {
          title: "The 90th percentile is a threshold",
          text: "A 90th-percentile week is one better than 90% of weeks. It's how you define 'a big game' without picking a number out of the air.",
          code: "weeks.quantile(0.25)  # bottom of the box\nweeks.quantile(0.75)  # top of the box",
        },
        film: [
          {
            title: "Why the IQR beats the range",
            text: "The range is the best week minus the worst, so one fluke sets it. The IQR only looks at the middle half, so it describes the weeks you'll actually see.",
          },
        ],
        exercises: [
          mc(
            "A running back's week ranks at the 80th percentile. What does that mean?",
            ["He scored 80 points", "80% of weeks were at or below it", "He played 80% of snaps", "It was 80% of his best week"],
            1,
            "A percentile is a rank, not a score: 80% of the comparison weeks sit at or below this one.",
          ),
          py(
            "Print the 25th and 75th percentiles of the boom receiver's weeks.",
            `${TWO_WRS}\n# the 25th and 75th percentiles of weeks["boom"]\n`,
            `${TWO_WRS}\nprint(weeks["boom"].quantile([0.25, 0.75]).tolist())`,
            'weeks["boom"].quantile([0.25, 0.75]) returns both; .tolist() prints them as a plain list.',
            "Half his weeks fall between those two numbers, and the gap between them is wide. That's what boom or bust looks like on a box plot.",
          ),
          mc(
            "One player's range is 40 points and his IQR is 6. What's the shape of his season?",
            ["Wildly inconsistent every week", "Mostly steady, with one or two outliers", "Always near zero", "Impossible: the IQR can't be smaller"],
            1,
            "A small middle half with a wide range means ordinary weeks are close together and a couple of games sit far away.",
          ),
          fill(
            "The middle half of the data has a name.",
            ["IQR = Q3 - ", null],
            ["Q1", "Q2", "median", "max"],
            ["Q1"],
            "The interquartile range is the 75th percentile (Q3) minus the 25th (Q1).",
          ),
        ],
      },
      {
        id: "st-spread-l3",
        title: "How Unusual Was That?",
        blurb: "A 30-point week means different things for a QB and a TE.",
        brief: {
          goal: "Use a z-score to compare a performance against its own group.",
          steps: [
            {
              title: "Thirty for whom?",
              body: "Thirty points is a good day for a quarterback. For a tight end it's the game of the year. The number is the same; how unusual it is isn't.",
            },
            {
              title: "Count the standard deviations",
              body: "A z-score is how many standard deviations a value sits above its group's average. Zero is average. Two is rare. Three is a story.",
              note: "z = (value − average) ÷ standard deviation.",
            },
          ],
          setup: "To compare across groups, measure each value against its own group: subtract the group average, divide by the group's spread.",
        },
        intro: {
          title: "A z-score puts everyone on one scale",
          text: "Subtract the average and divide by the standard deviation. Now a tight end's week and a quarterback's week can be compared fairly.",
          code: "z = (30 - 12) / 6   # tight end: 3.0, rare\nz = (30 - 21) / 7   # quarterback: about 1.3",
        },
        film: [
          {
            title: "Standardising is the move behind every 'adjusted' stat",
            text: "When a site says a stat is 'adjusted for position', it has usually done exactly this: compared each player to his own group.",
          },
        ],
        exercises: [
          mc(
            "Tight ends average 12 with a standard deviation of 6. One scores 30. What's his z-score?",
            ["1.5", "2", "3", "18"],
            2,
            "(30 − 12) ÷ 6 = 3: three standard deviations above the tight-end average. Very rare.",
          ),
          py(
            "Print the z-score of a 30-point week for a tight end (average 12, standard deviation 6) and for a quarterback (average 21, standard deviation 7), each rounded to two decimals.",
            "# z = (value - average) / std\nte_avg, te_std = 12, 6\nqb_avg, qb_std = 21, 7\n",
            "te_avg, te_std = 12, 6\nqb_avg, qb_std = 21, 7\nprint(round((30 - te_avg) / te_std, 2))\nprint(round((30 - qb_avg) / qb_std, 2))",
            "Two print lines: round((30 - te_avg) / te_std, 2), then the same for the quarterback.",
            "Same 30 points, and one is more than twice as unusual as the other. That's why raw points mislead across positions.",
          ),
          mc(
            "A z-score is negative. What does that tell you?",
            ["The data is wrong", "The value is below its group's average", "The player scored negative points", "The standard deviation is negative"],
            1,
            "Negative just means below average; the size says how far.",
          ),
          fill(
            "Standardise a column in pandas.",
            ['df["z"] = (df["pts"] - df["pts"].', null, '()) / df["pts"].', null, "()"],
            ["mean", "std", "max", "sum"],
            ["mean", "std"],
            "Subtract the mean, divide by the standard deviation: every value is now in standard deviations from average.",
          ),
        ],
      },
    ],
  },
  {
    id: "st-relate",
    number: 32,
    title: "Relationships and Proof",
    drive: "8th Drive · 3rd & Short",
    description: "When two numbers move together, and how sure you can be that a difference is real.",
    skills: ["Correlation", "Confounders", "Margin of error", "A/B tests"],
    status: "live",
    lessons: [
      {
        id: "st-relate-l1",
        title: "Moving Together",
        blurb: "Correlation measures it. It doesn't explain it.",
        brief: {
          goal: "Read a correlation, and stop before calling it a cause.",
          steps: [
            {
              title: "Targets and points",
              body: "Receivers who get more targets tend to score more. Plot them and the dots climb from bottom left to top right.",
            },
            {
              title: "One number for the climb",
              body: "Correlation runs from −1 to 1. Near 1, the dots hug a rising line. Near 0, no straight-line pattern. Near −1, a falling one.",
              note: "It measures a straight-line pattern only. A curve can have a correlation near zero.",
            },
          ],
          setup: "Correlation says how tightly two numbers move together in a line. It doesn't say which one moves the other, or whether a third thing moves both.",
        },
        intro: {
          title: "A third thing can move both",
          text: "Teams that pass more score more fantasy points for receivers and give up more garbage-time points. The game script moves both. That's a confounder.",
        },
        film: [
          {
            title: "Ice cream and sunburn",
            text: "They rise together every summer. Neither causes the other: the sun causes both. Ask what else changed before you call a correlation a cause.",
          },
        ],
        exercises: [
          mc(
            "Targets and fantasy points have a correlation of 0.9. What can you say?",
            ["More targets cause more points, proven", "They rise together very closely", "Points cause targets", "There's no relationship"],
            1,
            "0.9 is a tight rising pattern. Cause needs more: here it's plausible, but the number alone doesn't prove it.",
          ),
          py(
            "Print the correlation between targets and points for these receivers, rounded to two decimals.",
            'import pandas as pd\n\nwr = pd.DataFrame({\n    "targets": [4, 6, 7, 9, 10, 12],\n    "points":  [6.1, 9.8, 11.2, 15.4, 14.9, 21.3],\n})\n\n# correlation of the two columns, rounded to 2 decimals\n',
            'import pandas as pd\nwr = pd.DataFrame({"targets": [4, 6, 7, 9, 10, 12], "points": [6.1, 9.8, 11.2, 15.4, 14.9, 21.3]})\nprint(round(wr["targets"].corr(wr["points"]), 2))',
            'wr["targets"].corr(wr["points"]) gives the correlation; round it to 2.',
            "Very close to 1: the dots sit near a rising line. Whether targets cause points is a football argument, not a statistics one.",
          ),
          mc(
            "Kickers on teams with bad offences score more field-goal points. Why might that be?",
            ["Bad offences make kickers better", "Stalled drives end in field-goal tries instead of touchdowns", "Field goals are worth more there", "It's random and means nothing"],
            1,
            "The offence stalls, so drives end in kicks. The kicker didn't improve; the situation changed.",
          ),
          mc(
            "A correlation is 0. Which is still possible?",
            ["The two numbers are strongly related in a curve", "They are perfectly related in a straight line", "One always doubles the other", "Nothing; zero means no relationship of any kind"],
            0,
            "Correlation only sees straight lines. A U-shape can have a correlation near zero and still be a strong pattern.",
          ),
        ],
      },
      {
        id: "st-relate-l2",
        title: "Margin of Error",
        blurb: "An average from four games comes with a wide fence around it.",
        brief: {
          goal: "Put a margin of error around an average, and see it shrink as games pile up.",
          steps: [
            {
              title: "Four games, one guess",
              body: "A player averages 18 over four games. His real level could be 14 or 22: four games can't pin it down.",
            },
            {
              title: "A fence around the guess",
              body: "A margin of error is that fence. A rough 95% fence is the average plus or minus 2 × (standard deviation ÷ √games).",
              note: "More games, smaller fence: the √games is why.",
            },
          ],
          setup: "Every average from a sample has uncertainty. The margin of error says how much, and it shrinks with the square root of the sample size.",
        },
        intro: {
          title: "Quadruple the games to halve the fence",
          text: "The fence shrinks with √n. Four times as many games cuts it in half; it doesn't vanish.",
          code: "std = 8\n4 games:  ±2 × 8/√4  = ±8\n16 games: ±2 × 8/√16 = ±4",
        },
        film: [
          {
            title: "Say the fence out loud",
            text: "'He averages 18, give or take 8' is a more honest sentence than 'he averages 18', and it stops a trade made on four games.",
          },
        ],
        exercises: [
          py(
            "Print the rough 95% margin of error, 2 × std ÷ √n, for a player with a standard deviation of 8 over 4 games and over 16 games.",
            "import math\n\nstd = 8\n# print the margin for n = 4, then for n = 16\n",
            "import math\nstd = 8\nprint(2 * std / math.sqrt(4))\nprint(2 * std / math.sqrt(16))",
            "math.sqrt(n) is the square root. Print 2 * std / math.sqrt(4), then the same with 16.",
            "Four times the games halved the fence. That's the square root at work, and why a full season is so much more convincing than a month.",
          ),
          mc(
            "A player averages 20 over 4 games, give or take 9. Another averages 17 over 16 games, give or take 3. Which average do you trust more?",
            ["The 20, it's higher", "The 17, its fence is much tighter", "They're equally trustworthy", "Neither"],
            1,
            "The 20 could really be anywhere from 11 to 29. The 17 is pinned between 14 and 20.",
          ),
          fill(
            "The fence shrinks with the square root of the sample.",
            ["margin = 2 * std / math.", null, "(n)"],
            ["sqrt", "log", "pow", "exp"],
            ["sqrt"],
            "Standard deviation over the square root of n: the standard error. Doubled, it's a rough 95% fence.",
          ),
          mc(
            "To cut a margin of error in half, how many more games do you need?",
            ["Twice as many", "Four times as many", "Ten more", "One more"],
            1,
            "Halving it needs √n to double, which means four times the games.",
          ),
        ],
      },
      {
        id: "st-relate-l3",
        title: "Is the Difference Real?",
        blurb: "Home 19, away 17. Signal, or two noisy averages?",
        brief: {
          goal: "Check whether a gap between two groups is bigger than the noise in them.",
          steps: [
            {
              title: "Two averages, one gap",
              body: "A player averages 19 at home and 17 on the road. Is he better at home, or did a few games land on one side?",
            },
            {
              title: "Compare the gap to the noise",
              body: "If each average has a margin of error of ±4, a gap of 2 is well inside the noise. If the margins were ±0.5, the same gap would mean something.",
              note: "This is an A/B test in miniature: two groups, one difference, is it real?",
            },
          ],
          setup: "A difference between two groups only means something if it's bigger than the uncertainty in each. Small samples need big gaps.",
        },
        intro: {
          title: "Overlapping fences, no verdict",
          text: "Home 19 ± 4 runs 15 to 23. Away 17 ± 4 runs 13 to 21. The fences overlap a lot: the data can't tell them apart.",
        },
        film: [
          {
            title: "The same question every product team asks",
            text: "Button A converts 3.1%, button B 3.3%. Real, or noise? It's the home-and-away question with a website instead of a stadium.",
          },
        ],
        exercises: [
          mc(
            "Home average 19 ± 4, away average 17 ± 4. What's the honest read?",
            ["He's clearly better at home", "The gap is inside the noise; no conclusion yet", "He's better on the road", "Home and away don't matter"],
            1,
            "The two ranges overlap heavily, so a 2-point gap could easily be luck.",
          ),
          py(
            "Print the gap between the two averages, and whether it's bigger than the combined margin (the two margins added), as True or False.",
            "home, home_margin = 19.0, 4.0\naway, away_margin = 17.0, 4.0\n\n# print the gap, then whether gap > home_margin + away_margin\n",
            "home, home_margin = 19.0, 4.0\naway, away_margin = 17.0, 4.0\ngap = home - away\nprint(gap)\nprint(gap > home_margin + away_margin)",
            "gap = home - away, print it, then print(gap > home_margin + away_margin).",
            "Adding the margins is a rough, cautious check; a proper test is a bit less strict. Either way, 2 points against 8 points of noise isn't a finding.",
          ),
          mc(
            "With 100 games on each side, the margins shrink to ±0.8. The gap is still 2. Now what?",
            ["Still no conclusion", "The gap is now bigger than the noise: probably real", "The data is broken", "Gaps never matter"],
            1,
            "Same gap, much less noise. With enough data, a small difference can be a real one.",
          ),
          mc(
            "You test 20 different splits (home, dome, Mondays…) and one shows a 'real' difference. What should worry you?",
            ["Nothing, it passed", "With 20 tries, one fluke passing is expected", "You should test 20 more", "Splits are never real"],
            1,
            "Test enough splits and something will clear the bar by luck. That's why analysts decide what to test before looking.",
          ),
        ],
      },
    ],
  },
];

// ── Visualization ──────────────────────────────────────────────────

const VIZ: Unit[] = [
  {
    id: "vz-build",
    number: 33,
    title: "Build the Chart",
    drive: "9th Drive · 1st & Goal",
    description: "Bars, lines and scatters, built for real in the Viz Builder.",
    skills: ["Ranked bars", "Time series", "Scatter plots", "Top N"],
    status: "live",
    lessons: [
      {
        id: "vz-build-l1",
        title: "Bars for Ranking",
        blurb: "Sorted, labelled, and only as many as anyone will read.",
        brief: {
          goal: "Build a ranked bar chart that reads in two seconds.",
          steps: [
            {
              title: "A ranking is a sorted bar chart",
              body: "Who scored most? Bars, longest first, so the eye runs down the list. Unsorted bars make the reader do the sorting.",
            },
            {
              title: "Long names go sideways",
              body: "Player names are long. Put them on Rows and the bars run across the page, with every name readable. On Columns they'd tilt.",
              note: "Ten bars is a chart. Fifty is a spreadsheet with colours.",
            },
          ],
          setup: "Rank with bars, sort them, cut to the top few, and put long labels where they can be read.",
        },
        intro: {
          title: "Sort, then cut",
          text: "Sort highest first, keep the top ten, and the chart answers 'who led?' before anyone reads a number.",
        },
        film: [
          {
            title: "Bars start at zero",
            text: "A bar's length is its value, so a bar axis that starts at 200 makes 230 look twice 215. Lines can zoom in; bars can't.",
          },
        ],
        exercises: [
          mc(
            "Your bar chart of 32 teams is unsorted, alphabetical. What's the quickest fix?",
            ["Add colour", "Sort the bars by the value", "Make it a pie", "Add gridlines"],
            1,
            "Sorting turns a list into a ranking. Alphabetical order answers a question nobody asked.",
          ),
          viz(
            "Build it: the top 10 players by total 2024 points as horizontal bars, so the names are readable. Highest first.",
            {
              rows: [{ field: "player" }],
              columns: [{ field: "fantasy_pts", agg: "SUM" }],
              filters: [{ field: "season", values: [2024] }],
              mark: "bar",
              sort: "desc",
              top: 10,
            },
            "player on Rows (that makes the bars horizontal), SUM(fantasy_pts) on Columns, filter 2024, sort highest first, Top 10.",
            "Names on the vertical axis read straight across, and the longest bar at the top is the answer. Horizontal bars are the default for ranking named things.",
          ),
          mc(
            "Your bar axis starts at 300 and the bars run from 310 to 430. What's wrong?",
            ["Nothing", "The short bars look far smaller than they are", "The colours", "There are too few bars"],
            1,
            "Cut off the axis and a 310 bar looks a fraction of a 430 one. Bars need zero.",
          ),
        ],
      },
      {
        id: "vz-build-l2",
        title: "Lines for Time",
        blurb: "Weeks in order, one line per thing you're comparing.",
        brief: {
          goal: "Show change over time with lines, and compare a few series without a tangle.",
          steps: [
            {
              title: "Time runs left to right",
              body: "Put weeks or seasons on the horizontal axis and connect the points. The line says 'this came after that'.",
            },
            {
              title: "One line per thing",
              body: "Put the thing you're comparing on Color and you get one line each. Two or three lines compare well. Twelve is spaghetti.",
            },
          ],
          setup: "Lines are for order. Color splits them into series. Keep the series few enough to follow.",
        },
        intro: {
          title: "Color makes the series",
          text: "Season on Columns, a measure on Rows, and a dimension on Color: one line per value of that dimension.",
        },
        film: [
          {
            title: "Lines can zoom; bars can't",
            text: "A line's message is its slope, so its axis doesn't need zero. Zooming in to show a trend is fine, as long as the axis is labelled.",
          },
        ],
        exercises: [
          viz(
            "Has points per game changed across the seasons for running backs and receivers? Show one line for each position.",
            {
              columns: [{ field: "season" }],
              rows: [{ field: "fantasy_pts", agg: "AVG" }],
              color: [{ field: "position" }],
              filters: [{ field: "position", values: ["RB", "WR"] }],
              mark: "line",
            },
            "season on Columns, AVG(fantasy_pts) on Rows, position on Color, filter position to RB and WR, Line mark.",
            "Two lines, one story each. Filtering to the two series you're comparing keeps the chart about the question.",
          ),
          mc(
            "You've drawn 20 players as 20 lines on one chart. What should you do?",
            ["Add more colours", "Show fewer series, or one small chart per player", "Make the lines thicker", "Switch to a pie"],
            1,
            "Nobody can follow 20 lines. Cut to the few that matter, or split into small multiples.",
          ),
          mc(
            "Which question is a line chart the right answer for?",
            ["Who scored most in 2024?", "How did a player's points change week to week?", "What share of points came from each position?", "Do targets and points move together?"],
            1,
            "Change over an ordered axis like weeks is what lines are for.",
          ),
        ],
      },
      {
        id: "vz-build-l3",
        title: "Scatter for Relationships",
        blurb: "Two measures, one dot per player.",
        brief: {
          goal: "Build a scatter plot and read the pattern in it.",
          steps: [
            {
              title: "Two numbers per player",
              body: "Games played and total points: each player is a dot, placed by both at once. The cloud's shape is the relationship.",
            },
            {
              title: "Detail makes the dots",
              body: "Put a measure on Columns and another on Rows and you get one dot for everything. Put player on Detail and you get one dot per player.",
            },
          ],
          setup: "A scatter needs two measures, one per axis, and a dimension on Detail to say what each dot is.",
        },
        intro: {
          title: "The outliers are the interesting dots",
          text: "The cloud shows the rule; the dots far from it are the stories. A player with few games and lots of points was excellent when he played.",
        },
        film: [
          {
            title: "Label the few, not the many",
            text: "Labelling every dot buries the chart. Label the two or three dots the chart is about.",
          },
        ],
        exercises: [
          viz(
            "Do players who play more games score more? Plot games played against total points for 2024, one dot per player.",
            {
              columns: [{ field: "fantasy_pts", agg: "COUNT" }],
              rows: [{ field: "fantasy_pts", agg: "SUM" }],
              detail: [{ field: "player" }],
              filters: [{ field: "season", values: [2024] }],
              mark: "circle",
            },
            "COUNT(fantasy_pts) on Columns is games played (one row per game). SUM(fantasy_pts) on Rows. player on Detail. Filter 2024.",
            "Two measures make a scatter; the dimension on Detail makes one dot each. The dots far below the cloud are the injured; far above it, the stars.",
          ),
          mc(
            "Your scatter shows one single dot. What's missing?",
            ["A second measure", "A dimension on Detail to split it into one dot per player", "A colour", "A filter"],
            1,
            "Without a dimension, the measures add up across everyone into one point.",
          ),
          mc(
            "A dot sits far above the cloud: few games, high total. What's the likely story?",
            ["A data error", "A player who scored a lot per game but missed time", "The average player", "Nothing; outliers don't matter"],
            1,
            "High total on few games means a big per-game rate. The scatter found him; the per-game number confirms it.",
          ),
        ],
      },
    ],
  },
  {
    id: "vz-story",
    number: 34,
    title: "Make It Read",
    drive: "9th Drive · 2-Point Try",
    description: "Colour with a job, fewer series, and a title that states the finding.",
    skills: ["Colour", "Highlighting", "Titles", "Annotation"],
    status: "live",
    lessons: [
      {
        id: "vz-story-l1",
        title: "Colour With a Job",
        blurb: "Colour should separate or highlight, never decorate.",
        brief: {
          goal: "Use colour to group or highlight, and stop using it as decoration.",
          steps: [
            {
              title: "Rainbow bars say nothing",
              body: "Ten bars in ten colours makes the reader look for a meaning that isn't there.",
            },
            {
              title: "Give colour one job",
              body: "Colour by a category to group the bars, or grey everything and colour the one you're talking about.",
              note: "And don't make red and green the only difference: about one man in twelve can't tell them apart.",
            },
          ],
          setup: "Colour is a second axis. Use it for a category that matters, or to point at one thing.",
        },
        intro: {
          title: "Position on Color groups the bars",
          text: "Put position on Color and the leaderboard shows, at a glance, which positions fill the top spots.",
        },
        film: [
          {
            title: "Highlight beats legend",
            text: "If the chart is about one team, grey the rest and colour that team. A legend asks the reader to decode; a highlight just points.",
          },
        ],
        exercises: [
          viz(
            "Make the 2024 top 10 leaderboard show which positions dominate: colour the bars by position.",
            {
              columns: [{ field: "player" }],
              rows: [{ field: "fantasy_pts", agg: "SUM" }],
              color: [{ field: "position" }],
              filters: [{ field: "season", values: [2024] }],
              mark: "bar",
              sort: "desc",
              top: 10,
            },
            "Same leaderboard as before, with position on Color.",
            "Colour now carries a fact (position) instead of nothing. The quarterbacks near the top jump out without anyone reading a label.",
          ),
          mc(
            "Your chart's only difference between good and bad is red versus green. What's the risk?",
            ["None", "Colour-blind readers can't tell them apart", "Red is too bright", "Green means profit"],
            1,
            "Red-green colour blindness is common. Add a label, a symbol or a lightness difference too.",
          ),
          mc(
            "You're presenting one team's season. How should the other 31 teams look?",
            ["Each in its own colour", "Grey, with your team in a strong colour", "Hidden", "In the team's colours"],
            1,
            "Grey context, coloured subject: the reader's eye goes where you want it.",
          ),
        ],
      },
      {
        id: "vz-story-l2",
        title: "Fewer Series",
        blurb: "Compare the few things the question is about.",
        brief: {
          goal: "Cut a busy chart down to the series that answer the question.",
          steps: [
            {
              title: "The question picks the series",
              body: "'Did quarterbacks outscore running backs?' needs two lines. Not twenty players, not every position.",
            },
            {
              title: "Filter first, then draw",
              body: "Filter to the groups in the question, and the chart has nothing else to say.",
            },
          ],
          setup: "Every series on a chart is a claim on attention. Keep the ones the question asks about.",
        },
        intro: {
          title: "Aggregate up a level",
          text: "Twenty player lines become four position lines: the grain changes, and the pattern becomes readable.",
        },
        film: [
          {
            title: "Small multiples",
            text: "When every series matters, give each its own small chart with the same axes. Side by side, they compare better than one tangle.",
          },
        ],
        exercises: [
          viz(
            "Did quarterbacks or running backs score more per game in each season? Two lines, one per position.",
            {
              columns: [{ field: "season" }],
              rows: [{ field: "fantasy_pts", agg: "AVG" }],
              color: [{ field: "position" }],
              filters: [{ field: "position", values: ["QB", "RB"] }],
              mark: "line",
            },
            "season on Columns, AVG(fantasy_pts) on Rows, position on Color, filter to QB and RB, Line mark.",
            "The question named two groups, so the chart has two lines. Everything else would be noise.",
          ),
          mc(
            "Your stakeholder asks one question. Your chart shows twelve series. What do you do first?",
            ["Add a bigger legend", "Filter to the series the question is about", "Use thinner lines", "Add data labels to all twelve"],
            1,
            "Match the chart to the question. The rest can live in a second chart if anyone asks.",
          ),
          mc(
            "When are small multiples better than one chart with many lines?",
            ["Never", "When each series matters and they'd tangle on one chart", "When there's only one series", "When the data is categorical"],
            1,
            "Same axes, separate panels: every series stays readable and comparable.",
          ),
        ],
      },
      {
        id: "vz-story-l3",
        title: "Titles That Say the Finding",
        blurb: "Write the takeaway, not the axis labels.",
        brief: {
          goal: "Write a chart title that tells the reader what to see.",
          steps: [
            {
              title: "A label isn't a title",
              body: "'Points by player, 2024' describes the chart. 'Lamar led everyone in 2024' tells the reader what it shows.",
            },
            {
              title: "Then annotate the proof",
              body: "Point at the bar or the dot that proves the title. One note, in the right place, beats a paragraph underneath.",
            },
          ],
          setup: "Title = the finding. Annotation = where to look. The axis labels can stay boring.",
        },
        intro: {
          title: "Read the title, get the point",
          text: "A busy reader reads the title and moves on. Make sure that's enough.",
        },
        film: [
          {
            title: "If you can't write the title, you don't have the chart",
            text: "Struggling to say the finding in one line usually means the chart isn't answering one question yet.",
          },
        ],
        exercises: [
          mc(
            "Which is the best title for a chart of 2024 leaders?",
            ["Fantasy points by player", "2024 data", "Lamar Jackson led every player in 2024", "Chart 3"],
            2,
            "It states the finding. The reader knows what to look for before they look.",
          ),
          viz(
            "Build the chart behind the title 'Running backs dominated 2024's top five': the top 5 players of 2024, coloured by position, highest first.",
            {
              columns: [{ field: "player" }],
              rows: [{ field: "fantasy_pts", agg: "SUM" }],
              color: [{ field: "position" }],
              filters: [{ field: "season", values: [2024] }],
              mark: "bar",
              sort: "desc",
              top: 5,
            },
            "player on Columns, SUM(fantasy_pts) on Rows, position on Color, filter 2024, sort highest first, Top 5.",
            "Build it and check the title against it: with two quarterbacks in the top three, 'running backs dominated' isn't what this shows. Write the title from the chart, not before it.",
          ),
          fill(
            "A good title has two parts.",
            ["The ", null, ", then where to look: an ", null, "."],
            ["finding", "annotation", "legend", "axis"],
            ["finding", "annotation"],
            "Say what's true, then point at the proof.",
          ),
        ],
      },
    ],
  },
];

// ── Git ────────────────────────────────────────────────────────────

const GIT: Unit[] = [
  {
    id: "gt-history",
    number: 35,
    title: "History and Mistakes",
    drive: "10th Drive · Hurry-Up",
    description: "Read what happened, undo what went wrong, and keep secrets out of the repo.",
    skills: ["git log", "revert vs reset", "restore", ".gitignore"],
    status: "live",
    lessons: [
      {
        id: "gt-history-l1",
        title: "Read the Log",
        blurb: "Every commit is a note to the next person, usually you.",
        brief: {
          goal: "Read a repo's history, and write commit messages worth reading.",
          steps: [
            {
              title: "Who changed this, and why?",
              body: "A projection broke last Tuesday. git log lists every commit, newest first: who, when, and the message they wrote.",
            },
            {
              title: "The message is the why",
              body: "The diff shows what changed. Only the message says why. 'fix' says nothing; 'Use last 3 games, not 5, for the baseline' says everything.",
              note: "Write it for someone reading it in six months. That someone is usually you.",
            },
          ],
          setup: "git log reads the history. git show opens one commit. A good message says why, in the imperative: 'Add', 'Fix', 'Use'.",
        },
        intro: {
          title: "Three ways to read history",
          text: "git log for the list, git log --oneline for one line each, git show <commit> for one commit's changes.",
          code: "git log --oneline\n3f2a1c9 Use last 3 games for the baseline\n8b77d02 Add week 6 data\n1e0c4aa Start the projection notebook",
        },
        film: [
          {
            title: "Small commits read better",
            text: "One change per commit, one reason per message. A commit that 'updates stuff' across ten files can't be understood or undone cleanly.",
          },
        ],
        exercises: [
          mc(
            "Which commit message will help most in six months?",
            ["fix", "changes", "Use last 3 games, not 5, for the RB baseline", "asdf"],
            2,
            "It says what changed and why. The others make you open the diff and guess.",
          ),
          fill(
            "Show the history, one commit per line.",
            ["git log ", null],
            ["--oneline", "--all-in-one", "-short", "--list"],
            ["--oneline"],
            "git log --oneline: the short hash and the message, one per line.",
          ),
          mc(
            "You want to see exactly what one commit changed. Which command?",
            ["git show <commit>", "git status", "git init", "git clone <commit>"],
            0,
            "git show prints the commit's message and its diff.",
          ),
          mc(
            "Why do teams prefer small commits?",
            ["Git charges per line", "Each one has one reason, so it's easy to read, review and undo", "Big commits are illegal", "They run faster"],
            1,
            "One reason per commit means one clean thing to revert if it turns out wrong.",
          ),
        ],
      },
      {
        id: "gt-history-l2",
        title: "Undo Without Panic",
        blurb: "Most mistakes are one command away from gone.",
        brief: {
          goal: "Pick the right undo: restore a file, revert a commit, or fix the last one.",
          steps: [
            {
              title: "Not saved yet",
              body: "You broke a file and haven't committed. git restore <file> puts it back to the last commit.",
            },
            {
              title: "Already committed",
              body: "git revert <commit> makes a new commit that undoes an old one. History stays honest, so it's safe even after you've pushed.",
              note: "git reset rewrites history. Fine on your own branch before pushing; risky on a shared one.",
            },
          ],
          setup: "restore = undo uncommitted edits. revert = undo a commit with a new commit. commit --amend = fix the last commit before pushing.",
        },
        intro: {
          title: "Revert adds, reset removes",
          text: "Revert leaves the bad commit in history and adds its opposite. Reset moves the branch back as if it never happened. Teammates who pulled the bad commit are fine with a revert and broken by a reset.",
          code: "git restore notebook.ipynb   # throw away unsaved edits\ngit revert 3f2a1c9            # undo a pushed commit\ngit commit --amend            # fix the last, unpushed commit",
        },
        film: [
          {
            title: "Forgot a file in the last commit?",
            text: "git add the file, then git commit --amend. The last commit now includes it. Only do it before you push.",
          },
        ],
        exercises: [
          mc(
            "You pushed a commit that broke the projections, and teammates have pulled it. How do you undo it?",
            ["git reset --hard and force-push", "git revert the commit", "Delete the repo", "git restore the commit"],
            1,
            "Revert adds an undoing commit, so nobody's history breaks.",
          ),
          fill(
            "Throw away your unsaved edits to one file.",
            ["git ", null, " model.py"],
            ["restore", "revert", "push", "init"],
            ["restore"],
            "restore puts the file back to the last commit. It can't be undone, so be sure.",
          ),
          mc(
            "You committed, haven't pushed, and spotted a typo in the message. Simplest fix?",
            ["git revert", "git commit --amend", "Make a new repo", "Leave it"],
            1,
            "--amend rewrites the last commit. Safe because nobody else has it yet.",
          ),
          mc(
            "Why is git reset risky on a shared branch?",
            ["It deletes your files", "It rewrites history others already have", "It's slow", "It needs admin rights"],
            1,
            "Rewriting history that teammates pulled leaves their copies out of step with yours.",
          ),
        ],
      },
      {
        id: "gt-history-l3",
        title: "Keep Secrets Out",
        blurb: "An API key in a public repo is found in minutes.",
        brief: {
          goal: "Use .gitignore to keep keys, data and clutter out of the repo.",
          steps: [
            {
              title: "Bots read public repos",
              body: "Automated scanners search GitHub for keys all day. A key committed to a public repo can be used within minutes.",
            },
            {
              title: ".gitignore says what never goes in",
              body: "A file listing patterns Git should ignore: .env for secrets, big data files, notebook checkpoints, system junk.",
              note: "Ignoring a file doesn't remove one that was already committed. That needs git rm --cached, and a new key.",
            },
          ],
          setup: "Secrets live in .env, and .env lives in .gitignore. If a key was ever committed, rotate it: deleting it from the next commit doesn't remove it from history.",
        },
        intro: {
          title: "A sensible .gitignore",
          text: "One pattern per line. A trailing slash means a folder; * matches anything.",
          code: ".env\ndata/raw/\n*.csv\n.ipynb_checkpoints/\n.DS_Store",
        },
        film: [
          {
            title: "Committed a key? Rotate it",
            text: "Removing it in a new commit leaves it in every old one. Treat it as public: make a new key and revoke the old.",
          },
        ],
        exercises: [
          mc(
            "You committed your API key and pushed it to a public repo an hour ago. What's the first thing to do?",
            ["Delete the line and commit again", "Revoke the key and make a new one", "Make the repo private and forget it", "Nothing, nobody looks"],
            1,
            "Assume it's been copied. A new commit doesn't erase history, so the key has to die.",
          ),
          fill(
            "Keep the secrets file out of every commit.",
            ["# in ", null, "\n", null],
            [".gitignore", ".env", "README.md", "main.py"],
            [".gitignore", ".env"],
            "The .env file holds the secrets; listing it in .gitignore keeps it out.",
          ),
          mc(
            "You add data.csv to .gitignore, but it was committed last week. Is it ignored now?",
            ["Yes, immediately", "No, Git keeps tracking a file it already tracks", "Only on Mondays", "Only if you push"],
            1,
            "Ignore rules only apply to untracked files. git rm --cached data.csv stops tracking it.",
          ),
          mc(
            "Which belongs in a .gitignore for a data project?",
            ["The README", "Your analysis notebook", "Large raw data files and .env", "requirements.txt"],
            2,
            "Code and docs go in; secrets and big regenerable data stay out.",
          ),
        ],
      },
    ],
  },
  {
    id: "gt-team",
    number: 36,
    title: "Working With Others",
    drive: "10th Drive · Two-Minute Drill",
    description: "Pull before you push, fix a merge conflict, and write a README that gets read.",
    skills: ["fetch and pull", "push", "merge conflicts", "README"],
    status: "live",
    lessons: [
      {
        id: "gt-team-l1",
        title: "Pull Before You Push",
        blurb: "Your copy and GitHub's drift apart. Sync first.",
        brief: {
          goal: "Keep your copy in step with the team's: fetch, pull, then push.",
          steps: [
            {
              title: "Two copies of one repo",
              body: "Your laptop has one copy, GitHub has another. A teammate pushed this morning, so GitHub is ahead of you.",
            },
            {
              title: "Get theirs, then send yours",
              body: "git pull brings their commits down and merges them in. Then git push sends yours up. Push first and Git refuses: you're behind.",
              note: "git fetch downloads without merging, so you can look before you combine.",
            },
          ],
          setup: "origin is GitHub's copy. pull = fetch + merge. Push is rejected when you're behind; pull, fix anything that clashes, push again.",
        },
        intro: {
          title: "The rejected push",
          text: "\"Updates were rejected because the remote contains work that you do not have locally.\" It means: pull first.",
          code: "git pull origin main\ngit push origin main",
        },
        film: [
          {
            title: "Start the day with a pull",
            text: "Pulling before you start work keeps your changes small next to theirs, and makes conflicts rarer.",
          },
        ],
        exercises: [
          mc(
            "git push says your updates were rejected because the remote has work you don't have. What next?",
            ["Force-push", "git pull, then push again", "Delete your work", "git init"],
            1,
            "Bring their commits in, then yours go on top.",
          ),
          fill(
            "Bring the team's latest work into your branch.",
            ["git ", null, " origin main"],
            ["pull", "push", "clone", "commit"],
            ["pull"],
            "pull fetches from origin and merges into your current branch.",
          ),
          mc(
            "What's the difference between git fetch and git pull?",
            ["None", "fetch downloads without merging; pull downloads and merges", "fetch uploads", "pull only works on Mondays"],
            1,
            "fetch lets you look before you combine; pull does both in one step.",
          ),
          mc(
            "What does 'origin' usually mean?",
            ["Your first commit", "The remote copy you cloned from, usually GitHub", "The main branch", "The oldest file"],
            1,
            "origin is the default name for the remote repo.",
          ),
        ],
      },
      {
        id: "gt-team-l2",
        title: "Merge Conflicts",
        blurb: "Two people changed the same line. Git asks you to choose.",
        brief: {
          goal: "Read conflict markers and resolve a conflict calmly.",
          steps: [
            {
              title: "Same line, two changes",
              body: "You set the baseline to 3 games; a teammate set it to 5, on the same line. Git can't guess which you meant, so it stops and asks.",
            },
            {
              title: "The markers show both",
              body: "Between <<<<<<< and ======= is your version. Between ======= and >>>>>>> is theirs. Keep the right one (or a mix), delete the markers, commit.",
            },
          ],
          setup: "A conflict isn't an error, it's a question. Edit the file to the version you want, remove the markers, git add, git commit.",
        },
        intro: {
          title: "What a conflict looks like",
          text: "Everything outside the markers merged fine. Only this block needs a human.",
          code: "<<<<<<< HEAD\nBASELINE_GAMES = 3\n=======\nBASELINE_GAMES = 5\n>>>>>>> teammate-branch",
        },
        film: [
          {
            title: "Talk before you choose",
            text: "If you don't know why they changed it, ask. Resolving a conflict by deleting their change is how bugs come back.",
          },
        ],
        exercises: [
          mc(
            "In a conflict, which part is your branch's version?",
            ["Between <<<<<<< HEAD and =======", "Between ======= and >>>>>>>", "Below >>>>>>>", "Git deletes yours"],
            0,
            "HEAD is where you are, so the top half is yours.",
          ),
          mc(
            "You've edited the file to the version you want. What's left?",
            ["Nothing", "Delete the markers, git add the file, then commit", "git reset --hard", "Re-clone the repo"],
            1,
            "Markers out, file staged, commit: that completes the merge.",
          ),
          fill(
            "Mark the conflict resolved and finish the merge.",
            ["git ", null, " model.py\ngit ", null],
            ["add", "commit", "init", "clone"],
            ["add", "commit"],
            "Staging the fixed file tells Git it's resolved; the commit completes the merge.",
          ),
          mc(
            "How do you make conflicts rarer?",
            ["Never pull", "Pull often and keep branches small and short-lived", "Work in one giant file", "Turn off Git"],
            1,
            "Small, frequent syncs mean fewer lines changed in two places at once.",
          ),
        ],
      },
      {
        id: "gt-team-l3",
        title: "A README That Gets You Hired",
        blurb: "The first thing a hiring manager reads, often the only thing.",
        brief: {
          goal: "Write a README that explains a project in thirty seconds.",
          steps: [
            {
              title: "Thirty seconds on your repo",
              body: "A hiring manager opens your repo and reads the README. If it doesn't say what the project is and what you found, they close the tab.",
            },
            {
              title: "Four parts",
              body: "What it is in one line. The question and the finding. How to run it. What you'd do next.",
              note: "Put the chart near the top. A picture of the result sells the work faster than a paragraph.",
            },
          ],
          setup: "Lead with the finding, show a chart, say how to run it, say what's next. The README is the project's front page.",
        },
        intro: {
          title: "A README skeleton",
          text: "Short sections, plain language, the result up front.",
          code: "# Who's Actually Good in My League\nAll-play records for a 12-team league, 2025.\n\n## Finding\nTwo teams with losing records were top-4 by points.\n\n## Run it\npip install -r requirements.txt",
        },
        film: [
          {
            title: "Pin your best three",
            text: "GitHub lets you pin repos to your profile. Pin the three with the best READMEs, not the three with the most code.",
          },
        ],
        exercises: [
          mc(
            "What should the first lines of a project README say?",
            ["Your full CV", "What the project is and what you found", "A list of every file", "The licence"],
            1,
            "Lead with the point. Everything else is detail for the readers who stay.",
          ),
          mc(
            "Which README is more likely to impress a hiring manager?",
            ["'Analysis notebook. Run it.'", "One line on the question, the finding, a chart, how to run it", "No README; the code speaks", "A 40-page methods section"],
            1,
            "Question, finding, picture, instructions: everything they need in one screen.",
          ),
          fill(
            "Show the chart near the top of the README.",
            ["![", null, "](charts/all-play.png)"],
            ["All-play vs record", "click here", "image", "TODO"],
            ["All-play vs record"],
            "Markdown images take alt text in brackets. Describe the chart; it's also what screen readers say.",
          ),
          mc(
            "Your repo has 40 commits named 'update'. What does that tell a reviewer?",
            ["Nothing", "That the history won't explain your decisions", "That you work fast", "That Git is broken"],
            1,
            "Commit messages are part of the portfolio. They show how you think.",
          ),
        ],
      },
    ],
  },
];

// ── R ──────────────────────────────────────────────────────────────

const R_UNITS: Unit[] = [
  {
    id: "r-wrangle",
    number: 37,
    title: "Wrangling in R",
    drive: "11th Drive · 2nd OT",
    description: "New columns, joins and missing values, in real R in your browser.",
    skills: ["mutate", "left_join", "NA", "na.rm"],
    status: "live",
    lessons: [
      {
        id: "r-wrangle-l1",
        title: "mutate: New Columns",
        blurb: "Points per game is a column you make, not one you're given.",
        brief: {
          goal: "Add a calculated column with mutate.",
          steps: [
            {
              title: "The file has totals and games",
              body: "You want points per game, and the data doesn't have it. You make it: total divided by games, on every row.",
            },
            {
              title: "mutate adds the column",
              body: "mutate(ppg = points / games) keeps every row and adds ppg beside them. It's SELECT *, points / games AS ppg in SQL.",
            },
          ],
          setup: "mutate adds or changes columns row by row. Name the new column on the left of the =.",
        },
        intro: {
          title: "One row in, one row out",
          text: "Unlike summarise, mutate never collapses rows. Every player keeps his row and gains a column.",
          code: "df |> mutate(ppg = points / games)",
        },
        film: [
          {
            title: "Round at the end",
            text: "Keep full precision while you calculate and round only for display, or small errors pile up.",
          },
        ],
        exercises: [
          mc(
            "Which dplyr verb adds a column without dropping any rows?",
            ["summarise", "mutate", "filter", "count"],
            1,
            "mutate works row by row. summarise collapses; filter drops.",
          ),
          r(
            "Add a ppg column (points ÷ games, rounded to one decimal) and print the data frame.",
            'suppressMessages(library(dplyr))\n\ndf <- data.frame(\n  player = c("Jackson", "Allen", "Hurts"),\n  points = c(430.4, 379.1, 315.0),\n  games = c(17, 16, 15)\n)\n\n# mutate a ppg column, rounded to 1 decimal, then print(df)\n',
            'suppressMessages(library(dplyr))\ndf <- data.frame(player = c("Jackson", "Allen", "Hurts"), points = c(430.4, 379.1, 315.0), games = c(17, 16, 15))\ndf <- df |> mutate(ppg = round(points / games, 1))\nprint(df)',
            "df <- df |> mutate(ppg = round(points / games, 1)), then print(df).",
            "Three rows in, three rows out, one new column. That's mutate.",
          ),
          fill(
            "Add the column.",
            ["df |> ", null, "(ppg = points / games)"],
            ["mutate", "summarise", "filter", "arrange"],
            ["mutate"],
            "mutate makes the new column on every row.",
          ),
        ],
      },
      {
        id: "r-wrangle-l2",
        title: "Joins in dplyr",
        blurb: "left_join is LEFT JOIN with a pipe.",
        brief: {
          goal: "Combine two data frames on a shared column, keeping every row of the first.",
          steps: [
            {
              title: "Two tables, one key",
              body: "One frame has players and points. Another has players and their fantasy owner. The player name is the key that links them.",
            },
            {
              title: "left_join keeps the left",
              body: "left_join(points, owners, by = \"player\") keeps every row of points and fills in the owner. A player nobody owns gets NA.",
              note: "Same rules as SQL's LEFT JOIN: unmatched left rows survive with blanks.",
            },
          ],
          setup: "left_join(x, y, by = \"key\"): every row of x, matched columns from y, NA where there's no match.",
        },
        intro: {
          title: "NA is the honest blank",
          text: "When the right side has no match, the new columns are NA. That's information: those players are undrafted.",
          code: 'left_join(pts, owners, by = "player")',
        },
        film: [
          {
            title: "inner_join drops the unmatched",
            text: "inner_join keeps only players in both frames. Use it when an unmatched row is noise; use left_join when it's the finding.",
          },
        ],
        exercises: [
          r(
            "Join the owners onto the points and print the result. Every player should stay, even if nobody owns him.",
            'suppressMessages(library(dplyr))\n\npts <- data.frame(player = c("Jackson", "Chase", "Allen"), points = c(430.4, 403.0, 379.1))\nowners <- data.frame(player = c("Chase", "Allen"), owner = c("Riley", "Sam"))\n\n# left_join owners onto pts by player, then print it\n',
            'suppressMessages(library(dplyr))\npts <- data.frame(player = c("Jackson", "Chase", "Allen"), points = c(430.4, 403.0, 379.1))\nowners <- data.frame(player = c("Chase", "Allen"), owner = c("Riley", "Sam"))\nprint(left_join(pts, owners, by = "player"))',
            'print(left_join(pts, owners, by = "player")).',
            "Jackson keeps his row with NA for owner: in this little league, the best scorer went undrafted.",
          ),
          mc(
            "After a left_join, a player's owner is NA. What does that mean?",
            ["The join failed", "He had no match in the owners frame", "His points were missing", "R ran out of memory"],
            1,
            "NA after a left join is a missing match, which is often the most interesting row.",
          ),
          mc(
            "You only want players who appear in both frames. Which join?",
            ["left_join", "inner_join", "full_join", "anti_join"],
            1,
            "inner_join keeps the matches and drops the rest.",
          ),
        ],
      },
      {
        id: "r-wrangle-l3",
        title: "NA Isn't Zero",
        blurb: "One missing value can turn a whole average into NA.",
        brief: {
          goal: "Spot NA, count it, and decide what to do with it.",
          steps: [
            {
              title: "Missing spreads",
              body: "mean(c(20, NA, 30)) is NA. R won't guess what the missing value was, so the answer is unknown too.",
            },
            {
              title: "Say what to do with it",
              body: "na.rm = TRUE tells R to skip the missing values. is.na() finds them so you can count them first.",
              note: "Skipping and zero-filling give different answers. A missed game isn't a 0-point game.",
            },
          ],
          setup: "NA means unknown. Count it with sum(is.na(x)), skip it with na.rm = TRUE, and never replace it with 0 just to make an error go away.",
        },
        intro: {
          title: "Count it before you drop it",
          text: "Know how much is missing before you decide anything. Two NAs in 300 rows is different from 200.",
          code: "sum(is.na(x))          # how many are missing\nmean(x, na.rm = TRUE)  # average of the rest",
        },
        film: [
          {
            title: "Zero is a claim",
            text: "Filling NA with 0 says 'he played and scored nothing'. If he didn't play, that drags his average down for a game that never happened.",
          },
        ],
        exercises: [
          r(
            "Print how many weeks are missing, then the average of the weeks he played, rounded to one decimal.",
            "weeks <- c(25.1, 16.4, NA, 23.6, 33.4, NA, 34.4)\n\n# print the count of NAs, then the mean without them (1 decimal)\n",
            "weeks <- c(25.1, 16.4, NA, 23.6, 33.4, NA, 34.4)\nprint(sum(is.na(weeks)))\nprint(round(mean(weeks, na.rm = TRUE), 1))",
            "print(sum(is.na(weeks))), then print(round(mean(weeks, na.rm = TRUE), 1)).",
            "Count first, then skip. Five real games, two unknowns, and an average that only uses what happened.",
          ),
          mc(
            "mean(c(10, NA, 20)) returns NA. Why?",
            ["A bug in R", "One value is unknown, so the mean is unknown", "NA counts as 0", "mean only takes two numbers"],
            1,
            "R refuses to guess. Tell it what to do with na.rm = TRUE.",
          ),
          mc(
            "A player missed three games, stored as NA. You replace them with 0 before averaging. What happened?",
            ["Nothing changed", "His average dropped for games he never played", "His average rose", "R threw an error"],
            1,
            "Zero is a score. Missing isn't. Replacing one with the other changes the answer.",
          ),
        ],
      },
    ],
  },
  {
    id: "r-report",
    number: 38,
    title: "From Data to Report",
    drive: "11th Drive · Walk-Off",
    description: "Counts, labels and a function of your own: the steps between a frame and a finding.",
    skills: ["count", "case_when", "functions", "slice_max"],
    status: "live",
    lessons: [
      {
        id: "r-report-l1",
        title: "count and slice_max",
        blurb: "How many, and who's on top, in one line each.",
        brief: {
          goal: "Answer 'how many of each' and 'top N per group' quickly.",
          steps: [
            {
              title: "How many of each?",
              body: "count(position) is the fastest first look at any category: one row per value, with how many rows have it.",
            },
            {
              title: "Who's on top?",
              body: "slice_max(points, n = 1) keeps the row with the biggest value. After group_by, it keeps the top row of each group.",
            },
          ],
          setup: "count for frequencies, slice_max for the top rows. Grouped, slice_max gives the top of each group.",
        },
        intro: {
          title: "Top of each group, no window function",
          text: "In SQL this is ROW_NUMBER() OVER (PARTITION BY …). In dplyr it's group_by then slice_max.",
          code: "games |> group_by(player) |> slice_max(points, n = 1)",
        },
        film: [
          {
            title: "sort = TRUE",
            text: "count(position, sort = TRUE) puts the biggest group first, which is usually the order you want to read it in.",
          },
        ],
        exercises: [
          r(
            "Each player's best game: group by player, keep his top-scoring week, and print player, week and points.",
            `${R_WEEKLY}\n# group_by player, slice_max points (n = 1), select player, week, points, then print\n`,
            `${R_WEEKLY}best <- games |> group_by(player) |> slice_max(points, n = 1) |> ungroup() |> select(player, week, points)\nprint(as.data.frame(best))`,
            "games |> group_by(player) |> slice_max(points, n = 1) |> ungroup() |> select(player, week, points), then print(as.data.frame(best)).",
            "Grouped slice_max is 'the top row of each group', the job a window function does in SQL.",
          ),
          mc(
            "count(position, sort = TRUE) returns what?",
            ["The positions in alphabetical order", "One row per position with how many rows each, biggest first", "The total number of rows", "The first position"],
            1,
            "A frequency table, sorted by size.",
          ),
          fill(
            "Keep each player's single best game.",
            ["games |> ", null, "(player) |> ", null, "(points, n = 1)"],
            ["group_by", "slice_max", "summarise", "arrange"],
            ["group_by", "slice_max"],
            "Group first, then slice: the top row inside each group.",
          ),
        ],
      },
      {
        id: "r-report-l2",
        title: "Labels With case_when",
        blurb: "Turn numbers into words a reader can scan.",
        brief: {
          goal: "Label rows by rules with case_when.",
          steps: [
            {
              title: "Numbers to words",
              body: "A report reader doesn't want 23.8. They want 'boom'. case_when turns ranges into labels.",
            },
            {
              title: "First match wins",
              body: "case_when checks its rules in order and stops at the first that's true. Put the highest bar first. TRUE ~ at the end catches everything else.",
            },
          ],
          setup: "case_when(cond ~ label, …, TRUE ~ fallback). Rules run top to bottom, first match wins. It's CASE WHEN, in R.",
        },
        intro: {
          title: "Order is the logic",
          text: "A 25-point game is over 10 and over 20. Whichever rule comes first labels it, so the bigger threshold goes on top.",
          code: 'case_when(\n  points >= 20 ~ "boom",\n  points >= 10 ~ "solid",\n  TRUE ~ "bust"\n)',
        },
        film: [
          {
            title: "Then count the labels",
            text: "mutate the label, then count it: how many booms, solids and busts. Two lines from raw numbers to a summary a manager reads.",
          },
        ],
        exercises: [
          r(
            "Label each game boom (20+), solid (10 to 20) or bust (under 10), then print how many of each.",
            `${R_WEEKLY}\n# mutate a label with case_when, then count(label) and print it\n`,
            `${R_WEEKLY}out <- games |> mutate(label = case_when(points >= 20 ~ "boom", points >= 10 ~ "solid", TRUE ~ "bust")) |> count(label)\nprint(out)`,
            'mutate(label = case_when(points >= 20 ~ "boom", points >= 10 ~ "solid", TRUE ~ "bust")), then count(label).',
            "Highest bar first, a catch-all last, then count. The same three-bucket split works in SQL, pandas and Excel.",
          ),
          mc(
            "Your case_when puts points >= 10 ~ \"solid\" above points >= 20 ~ \"boom\". What happens to a 25-point game?",
            ["It's labelled boom", "It's labelled solid, because that rule matches first", "It gets both labels", "It errors"],
            1,
            "First match wins, so the lower bar catches it. Put the highest threshold first.",
          ),
          mc(
            "What does TRUE ~ \"bust\" do at the end of a case_when?",
            ["Nothing", "Labels every row no earlier rule matched", "Labels every row bust", "Ends the function"],
            1,
            "TRUE always matches, so it's the 'everything else' bucket.",
          ),
        ],
      },
      {
        id: "r-report-l3",
        title: "Write Your Own Function",
        blurb: "Did it twice? Make it a function.",
        brief: {
          goal: "Wrap a calculation you repeat in a function you can call.",
          steps: [
            {
              title: "Copy-paste is a bug waiting",
              body: "You've written points-per-game three times. Change the rounding in one place and the other two disagree.",
            },
            {
              title: "Name it once",
              body: "ppg <- function(points, games) { round(points / games, 1) }. Now ppg(430.4, 17) means the same thing everywhere.",
            },
          ],
          setup: "name <- function(args) { body }. The last value in the body is what it returns.",
        },
        intro: {
          title: "Functions work on vectors too",
          text: "Because R does arithmetic on whole vectors, ppg(c(430.4, 379.1), c(17, 16)) returns both rates at once.",
          code: "ppg <- function(points, games) {\n  round(points / games, 1)\n}",
        },
        film: [
          {
            title: "Small and named",
            text: "A good function does one thing and its name says what. ppg() beats calc2().",
          },
        ],
        exercises: [
          r(
            "Write ppg(points, games) that returns points per game rounded to one decimal, then print ppg(430.4, 17).",
            "# write the function, then print(ppg(430.4, 17))\n",
            "ppg <- function(points, games) {\n  round(points / games, 1)\n}\nprint(ppg(430.4, 17))",
            "ppg <- function(points, games) { round(points / games, 1) }, then print(ppg(430.4, 17)).",
            "One definition, called by name. Change the rounding inside it and every caller follows.",
          ),
          r(
            "Use your function on a whole vector: print ppg for these three seasons at once.",
            "ppg <- function(points, games) {\n  round(points / games, 1)\n}\n\npoints <- c(430.4, 379.1, 315.0)\ngames <- c(17, 16, 15)\n\n# print ppg(points, games)\n",
            "ppg <- function(points, games) {\n  round(points / games, 1)\n}\npoints <- c(430.4, 379.1, 315.0)\ngames <- c(17, 16, 15)\nprint(ppg(points, games))",
            "print(ppg(points, games)): R divides the vectors element by element.",
            "No loop needed: R's arithmetic works on whole vectors, so a function written for one number works for many.",
          ),
          mc(
            "What does an R function return if there's no return() call?",
            ["Nothing", "The value of its last expression", "Always NULL", "An error"],
            1,
            "The last value evaluated is the result. return() is only needed to leave early.",
          ),
        ],
      },
    ],
  },
];

export const MORE_UNITS: Unit[] = [...STATS, ...VIZ, ...GIT, ...R_UNITS];
