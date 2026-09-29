/**
 * Tableau, Power BI, and AI — same walk-in as SQL.
 *
 * These tools do not run in the browser. Lessons teach the idea, then the
 * learner builds in Tableau Public or Power BI Desktop. AI lessons are
 * judgment drills, not a live model call.
 */

import type { FillExercise, Lesson, MCExercise, Unit } from "./curriculum";

function mc(
  prompt: string,
  options: string[],
  answer: number,
  explain: string,
  code?: string,
): MCExercise {
  return code
    ? { type: "mc", prompt, code, options, answer, explain }
    : { type: "mc", prompt, options, answer, explain };
}

function fill(
  prompt: string,
  parts: (string | null)[],
  bank: string[],
  answer: string[],
  explain: string,
): FillExercise {
  return { type: "fill", prompt, parts, bank, answer, explain };
}

function lesson(partial: Lesson): Lesson {
  return partial;
}

export const TABLEAU_UNIT_IDS = [
  "tb-start",
  "tb-marks",
  "tb-calc",
  "tb-filters",
  "tb-dash",
  "tb-job",
] as const;

export const POWERBI_UNIT_IDS = [
  "pb-start",
  "pb-query",
  "pb-model",
  "pb-dax",
  "pb-report",
  "pb-job",
] as const;

export const AI_UNIT_IDS = [
  "ai-how",
  "ai-prompt",
  "ai-analyst",
  "ai-api",
  "ai-judge",
] as const;

export const BI_UNITS: Unit[] = [
  {
    id: "tb-start",
    number: 1,
    title: "What Tableau Is",
    drive: "1st Drive · Own 25",
    description: "What this course is, what Tableau is, then the first chart.",
    skills: ["Tableau Public", "Dimensions", "Measures"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-start-l1",
        title: "A picture someone else can use",
        blurb: "What this course is, and which Tableau you actually install.",
        brief: {
          goal: "Know what Tableau is for, and which version to open.",
          setup:
            "This course is a dashboard someone can use without you in the room. You build it in Tableau Public, which is free. This site quizzes the ideas. It does not open Tableau.",
          steps: [
            {
              title: "What you're here to do",
              body: "You already have a finding. This course is how you put it on a page someone else can filter, without you standing there. The examples are football scores, because a score is easy to picture.",
            },
            {
              title: "What to expect",
              body: "Lessons are a few minutes each. You read a little, then you answer. This browser cannot run Tableau. You follow the same ideas in Tableau Public, which is free, using a CSV. A miss shows why.",
            },
            {
              title: "Where this course sits",
              body: "Data Analyst and BI Analyst take this after SQL, and often after Excel. The tool is called Tableau. SQL gets the list. Tableau turns that list into a page with filters.",
            },
            {
              title: "Three products share the name",
              body: "Tableau Public is the free one. You publish to a public web address, so do not put private league data there. Desktop is the paid app most offices use. Cloud, which used to be called Server, is where a company hosts the file so coworkers can open it.",
            },
          ],
        },
        intro: {
          title: "Build in Public. Don't publish secrets.",
          text: "Public is enough to learn and to show a portfolio. A public URL means anyone can open the data behind the chart. Real customer or league data stays in Desktop or Cloud.",
        },
        film: [
          {
            title: "Spreadsheets still have a job",
            text: "Excel answers a question for you. Tableau answers a question for someone who will click around after you leave. If the audience is only you, a sheet may be enough.",
          },
        ],
        exercises: [
          mc(
            "A hiring manager asked for a dashboard they can filter without you. Which tool matches that ask?",
            ["A private spreadsheet only you open", "Tableau", "A SQL query with no picture", "A slide of last week's numbers"],
            1,
            "The job is a page someone else can change. Tableau is built for that. A one-off sheet is not.",
          ),
          mc(
            "You want a free portfolio piece using the public season file. What do you install?",
            ["Tableau Cloud", "Tableau Public", "A paid Desktop license", "Nothing — this site runs Tableau"],
            1,
            "Public is free and publishes a URL. This course does not open the app for you.",
          ),
          mc(
            "Your friend's private league salaries are in the file. Where should that dashboard live?",
            ["Tableau Public", "Desktop or a company Cloud site, not Public", "A screenshot in a group chat", "A public GitHub repo with the salaries"],
            1,
            "Public means public. Salaries and private league data do not go on a Public URL.",
          ),
          fill(
            "Name the free product you publish a portfolio dashboard to.",
            ["Tableau ", null],
            ["Public", "Cloud", "Desktop"],
            ["Public"],
            "Tableau Public is the free one, and the page it makes is visible to anyone.",
          ),
        ],
      }),
      lesson({
        id: "tb-start-l2",
        title: "Categories and numbers",
        blurb: "A name is not a total. Blue and green say which is which.",
        brief: {
          goal: "Tell a category from a number you are allowed to add.",
          setup:
            "Player is a label. Points is a number you can total. Tableau colors those two jobs differently.",
          steps: [
            {
              title: "You dropped the wrong thing on the shelf",
              body: "You wanted one bar per player. You got one giant bar, or a thousand marks, and you are not sure why. The field was the wrong kind.",
            },
            {
              title: "A label slices. A number adds.",
              body: "A category, like player or team, is called a dimension. It slices the page into groups. A number you total, like points, is called a measure. Tableau sums a measure unless you tell it not to.",
            },
            {
              title: "Blue and green are that same split",
              body: "Blue means distinct buckets: one player, then the next. Green means a continuous scale, like a line of points. Blue and green are not decoration. They say whether you chopped the axis into names or left it as a number line.",
              note: "People call the pills on the shelves blue and green. A pill is just the field you dragged up.",
            },
          ],
        },
        intro: {
          title: "Player is blue. Points want to be summed.",
          text: "Drag player to rows and points to columns and you get a bar chart: one bar per player, height equal to that player's points. If points is treated as a bunch of labels, you do not get a total.",
          code: "Rows: Player          (dimension, blue)\nColumns: SUM(Points)   (measure, usually green)",
        },
        film: [
          {
            title: "The first chart is a leaderboard",
            text: "Points by player, sorted high to low, is the chart you should be able to make in a minute. Everything later is that, plus a filter or a second number.",
          },
        ],
        exercises: [
          mc(
            "You want one bar per player, height equal to season points. Which field is the dimension?",
            ["Points", "Player", "The sum", "The color legend"],
            1,
            "Player slices the chart into one bar each. Points is the number those bars show.",
          ),
          mc(
            "SUM(Points) is on the columns shelf and the bars look right. What kind of field is Points here?",
            ["A dimension, because it is green", "A measure, because Tableau added it", "A filter", "A sheet name"],
            1,
            "SUM wrapped around it means Tableau treated points as a measure and totaled it.",
          ),
          mc(
            "The axis shows player names, one tick per name, and the pill is blue. What does blue mean?",
            ["The chart is pretty", "Those are separate buckets, not a number line", "The field is a measure", "The dashboard is published"],
            1,
            "Blue is discrete: distinct groups. Green is a continuous scale.",
          ),
          fill(
            "A category that slices the chart is a ",
            [null, ". A number you total is a ", null, "."],
            ["dimension", "measure", "filter", "dashboard"],
            ["dimension", "measure"],
            "Dimension groups. Measure is the number Tableau aggregates.",
          ),
        ],
      }),
    ],
  },
  {
    id: "tb-marks",
    number: 2,
    title: "The Picture",
    drive: "2nd Drive · Own 40",
    description: "Bars, lines, and dots — pick the mark the question needs.",
    skills: ["Bar", "Line", "Scatter"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-marks-l1",
        title: "The mark is the picture",
        blurb: "Same fields, different mark, different question.",
        brief: {
          goal: "Match bar, line, and scatter to the question.",
          setup:
            "A mark is the shape Tableau draws: a bar, a line, a dot. The question picks it.",
          steps: [
            {
              title: "The leaderboard and the season do not want the same shape",
              body: "Who scored the most is a race. How one player moved week by week is a path. Whether more targets mean more points is a cloud of dots.",
            },
            {
              title: "Bar, line, dot",
              body: "Compare amounts, use a bar. Track a number across weeks, use a line, and put the week in time order. Ask whether two numbers move together, use a dot per player. That third picture is a scatter.",
            },
          ],
        },
        intro: {
          title: "Sort the bars or the story is upside down.",
          text: "A bar chart of points that is not sorted makes you hunt. Sort descending so the best season is at the top or the left. A line chart that is not in week order looks like noise.",
        },
        film: [
          {
            title: "A map is a scatter on geography",
            text: "Team locations can be dots on a map. If the question is not about place, a map is decoration. Scoring is rarely a geography question.",
          },
        ],
        exercises: [
          mc(
            "How did Jefferson's points change from week 1 to week 17?",
            ["A bar chart of all players", "A line, week on the axis", "A pie of positions", "A map of stadiums"],
            1,
            "Time on the axis, points up the side, a line connecting the weeks.",
          ),
          mc(
            "Do players with more targets score more points? One dot per player.",
            ["Scatter", "Line of one player", "A single total", "A text table of salaries"],
            0,
            "Two numbers, one mark per player. That is a scatter.",
          ),
          mc(
            "Eight running backs, season points, you want the highest obvious. What else besides bars?",
            ["Leave them in alphabetical order", "Sort the bars descending", "Turn it into a pie", "Use a line chart with no dates"],
            1,
            "Sorted bars are a leaderboard. Alphabetical bars hide the ranking.",
          ),
          fill(
            "A dot per player, targets across and points up, is a ",
            [null, " plot."],
            ["scatter", "bar", "map"],
            ["scatter"],
            "Two measures, one mark per row, is a scatter.",
          ),
        ],
      }),
      lesson({
        id: "tb-marks-l2",
        title: "When the mark is wrong",
        blurb: "Pies, dual axes, and charts that hide the point.",
        brief: {
          goal: "Reject a picture that makes a true number hard to see.",
          setup:
            "A dual axis draws two different scales on one chart. It is easy to make a fake comparison.",
          steps: [
            {
              title: "Six slices that look the same",
              body: "A pie of six positions with close point totals makes you compare angles. People read lengths better than slices. Sorted bars win that one.",
            },
            {
              title: "Two scales can lie",
              body: "Volume and points per target can share a chart. If each has its own axis, a small rate can look as tall as a huge point total. Label both axes, or the comparison is fake.",
              note: "That two-axis chart is called a dual axis. Use it when the shapes matter, not when the heights should be compared.",
            },
          ],
        },
        intro: {
          title: "Box plots show the ordinary week, not just the best one.",
          text: "A bar of season points hides a player who scored 40 once and 4 every other week. A box plot shows the middle and the spread. Use it when the question is consistency.",
        },
        film: [
          {
            title: "Highlight tables are colored grids",
            text: "A schedule of points by player and week is a table. Color the cells by the number and it becomes a heat map. The grid was already the right layout.",
          },
        ],
        exercises: [
          mc(
            "Six positions, similar totals. Which picture makes the ranking easiest?",
            ["A pie", "Sorted bars", "A dual axis with a hidden legend", "A map"],
            1,
            "Lengths are easier to compare than slices, especially when the slices are close.",
          ),
          mc(
            "Points per game and total targets share a chart. Each has its own axis, and the rate looks taller than the volume. What is wrong?",
            ["Nothing, taller always means more", "Two scales can make a small number look huge", "You needed a pie", "The players should be green"],
            1,
            "A dual axis does not put the numbers in the same units. Read the axes before you read the height.",
          ),
          mc(
            "You care whether a back's typical week is steady, not just the season sum. Which mark helps?",
            ["A box plot", "A pie of one player", "An unsorted list of names", "A single grand total"],
            0,
            "A box shows the middle and the spread. A season total hides a fluke week.",
          ),
          fill(
            "A chart with two different number scales is a dual ",
            ["dual ", null, "."],
            ["axis", "pie", "filter"],
            ["axis"],
            "Dual axis means two scales. Label them, or the heights are not comparable.",
          ),
        ],
      }),
    ],
  },
  {
    id: "tb-calc",
    number: 3,
    title: "Calculations",
    drive: "3rd Drive · Midfield",
    description: "Points per game, then the two ways a total can be wrong.",
    skills: ["Calculated field", "LOD", "Table calc"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-calc-l1",
        title: "A number the sheet does not have",
        blurb: "Points per game, and the total that got doubled.",
        brief: {
          goal: "Write points per game, and not divide the sums in the wrong order.",
          setup:
            "A calculated field is a new column you define with a formula. Where you divide matters.",
          steps: [
            {
              title: "The file has points and games, not the rate",
              body: "Someone asks who was efficient, not who played the most weeks. You need points divided by games. That number is not a column yet.",
            },
            {
              title: "Write it once",
              body: "A calculated field is a formula Tableau stores, like points / games. You can drop it on a shelf the same way you drop points.",
            },
            {
              title: "Divide the row, or divide the totals",
              body: "Points / games on each game, then averaged, is not the same as total points divided by total games. If you sum first, one formula. If you divide each row first, another. Mixing them doubles people or invents a rate nobody had.",
              note: "Row-level means one line at a time. Aggregate means after the total.",
            },
          ],
        },
        intro: {
          title: "SUM(points) / SUM(games) is the season rate.",
          text: "That divides the totals. SUM(points / games) averages the weekly rates instead, and a short week weighs the same as a full one. For a season rate, sum both sides first.",
          code: "SUM([Points]) / SUM([Games])",
        },
        film: [
          {
            title: "IF and CASE label a row",
            text: "You can tag a player High, Mid, or Low with IF. Put the strictest test first, same as any chain of conditions. The label is still a category.",
          },
        ],
        exercises: [
          mc(
            "You want each player's season points per game. Which formula matches?",
            ["SUM([Points]) / SUM([Games])", "SUM([Points] / [Games])", "[Points] - [Games]", "COUNT([Player])"],
            0,
            "Season rate is total points over total games. Divide after you sum.",
          ),
          mc(
            "You divided points by games on every row, then summed those rates. The leaderboard looks inflated. Why?",
            ["You built a season rate", "You added weekly rates instead of dividing the totals", "Tableau dropped the zeros", "Blue pills cannot be added"],
            1,
            "Summing rates is not a rate of sums. The order of the division is the bug.",
          ),
          mc(
            "A calculated field is…",
            ["A filter the user clicks", "A formula you saved, usable like any other field", "The sheet title", "A published URL"],
            1,
            "You define it once. After that it sits in the field list with the columns that came from the file.",
          ),
          fill(
            "Season points per game puts which word in front of both points and games?",
            ["Divide the ", null, " of points by the same kind of total of games."],
            ["sum", "name", "color"],
            ["sum"],
            "SUM of points over SUM of games is the season rate. Divide after the totals.",
          ),
        ],
      }),
      lesson({
        id: "tb-calc-l2",
        title: "A total beside each player",
        blurb: "Level of detail versus a calculation that only sees the view.",
        brief: {
          goal: "Know when a total should ignore the marks on the chart.",
          setup:
            "A table calculation looks at the numbers already in the picture. A level-of-detail expression looks at the rows you name, even if the picture is finer.",
          steps: [
            {
              title: "Each player, and also their team's total",
              body: "The chart is one bar per player. You also want that player's team total on the same row. The picture's grain is the player. The team total is coarser.",
            },
            {
              title: "Name the grain",
              body: "A level of detail expression, an LOD, computes at a grain you write down. FIXED team means one number per team, repeated beside every player on that team. INCLUDE and EXCLUDE add or drop a field from the picture's grain.",
            },
            {
              title: "A table calculation only sees the view",
              body: "Percent of total and running total, done as table calculations, use the marks on the screen. Filter a team out and the percent changes, because the total changed. Compute using means which direction those marks run: across the table, or down it.",
            },
          ],
        },
        intro: {
          title: "LOD for the team. Table calc for the view.",
          text: "If the team total must stay put when you hide a player, use FIXED. If the percent should be of whatever is on the page, use a table calculation.",
          code: "{ FIXED [Team] : SUM([Points]) }",
        },
        film: [
          {
            title: "Quick table calcs hide the direction",
            text: "The right-click menu that says Percent of Total is a table calculation with a default direction. If the percent looks like 100 for every row, the direction is the row itself. Change compute using.",
          },
        ],
        exercises: [
          mc(
            "Each player bar should show that player's team total, and hiding one player must not change the team number. Which do you write?",
            ["A table calculation, percent of total", "FIXED on team", "A filter", "A new pie"],
            1,
            "FIXED computes at the team, independent of which players are on the chart.",
          ),
          mc(
            "Percent of total should be of the players currently on the page. A teammate is filtered out, so the percent should move. What is that?",
            ["A FIXED LOD", "A table calculation", "A row-level IF", "A published workbook"],
            1,
            "A table calculation uses the marks in the view. Change the view and the percent changes.",
          ),
          mc(
            "Every row says 100% of total. What do you check first?",
            ["The color palette", "Compute using — the direction the table calc runs", "Whether the file is a CSV", "The worksheet title"],
            1,
            "If the computation is along a single mark, that mark is 100% of itself.",
          ),
          fill(
            "An expression that computes at a grain you name, like one total per team, is an ",
            [null, "."],
            ["LOD", "axis", "story"],
            ["LOD"],
            "LOD is level of detail. FIXED names the grain.",
          ),
        ],
      }),
    ],
  },
  {
    id: "tb-filters",
    number: 4,
    title: "Let Them Click",
    drive: "4th Drive · Red Zone",
    description: "Filters, a switch for the metric, and a click that filters the page.",
    skills: ["Filter", "Parameter", "Action"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-filters-l1",
        title: "Filters and a switch",
        blurb: "What the click keeps, and what the user is allowed to choose.",
        brief: {
          goal: "Tell a filter from a parameter.",
          setup:
            "A filter keeps some rows and drops others. A parameter is a value the user sets, which your formula reads.",
          steps: [
            {
              title: "They want the WR page, then the RB page",
              body: "You should not build two workbooks. You put position on a filter so the same chart changes.",
            },
            {
              title: "A filter drops rows",
              body: "A filter keeps the rows that match. There are several kinds — a filter on a dimension, a filter on a measure, and filters that happen at different times in Tableau's order. A filter that runs too late has already been included in a total.",
            },
            {
              title: "A parameter does not drop rows by itself",
              body: "A parameter is a single choice: this metric, this season, this threshold. Nothing happens until a formula or a filter reads it. That is how you let someone switch the chart from points to points per game.",
            },
          ],
        },
        intro: {
          title: "Filter the rows. Parameter the choice.",
          text: "Show only wide receivers: filter. Let them pick whether the bar is points or targets: parameter, and a calculated field that reads the choice.",
        },
        film: [
          {
            title: "Order of operations is why a total looks early",
            text: "FIXED calculations can be computed before dimension filters, unless the filter is in context. If a team total ignores the position filter you just clicked, that order is why.",
          },
        ],
        exercises: [
          mc(
            "The dashboard should show only week 1, not every week. What do you add?",
            ["A filter on week", "A new data source", "A story point", "A green pill with no shelf"],
            0,
            "A filter keeps the rows you name. Week 1 is a subset of rows.",
          ),
          mc(
            "The user should switch the bars between points and targets. Nothing is dropped. What is that control?",
            ["A parameter the formula reads", "A dimension filter on player", "A tooltip", "An extract"],
            0,
            "A parameter is a single value you set. The formula decides what the chart does with it.",
          ),
          mc(
            "The team total ignored the position filter you just applied. What is the usual cause?",
            ["The color is green", "The total was computed before that filter", "Public cannot filter", "The player names are too long"],
            1,
            "Tableau has an order. A total computed earlier does not see a filter that happens later.",
          ),
          fill(
            "A single choice your formula reads, which does not drop rows by itself, is a ",
            [null, "."],
            ["parameter", "bar", "map"],
            ["parameter"],
            "A parameter holds a value. You still need a calculation or a filter that uses it.",
          ),
        ],
      }),
      lesson({
        id: "tb-filters-l2",
        title: "A click that changes the page",
        blurb: "Actions, groups, and a tooltip that answers the next question.",
        brief: {
          goal: "Make a click on a team filter the rest of the dashboard.",
          setup:
            "An action is a rule: when you click this sheet, do something to another sheet.",
          steps: [
            {
              title: "Click the team, see their players",
              body: "The left chart is teams. The right chart is players. Clicking a team should keep only that team's players. You should not ask them to find a second filter.",
            },
            {
              title: "That click is an action",
              body: "A filter action passes the team you clicked to the other sheet. A highlight action only marks those rows, it does not drop the rest. A URL action opens a link.",
            },
            {
              title: "A set is a saved group of rows",
              body: "A set is a list you define: these eight players, or whoever is in the top 10. A group is a label you glue on, like putting two teams into one bucket. A hierarchy is the drill: position, then player, then week.",
            },
          ],
        },
        intro: {
          title: "The tooltip should answer the next question.",
          text: "Hover is where team, week, and points per game belong if they would clutter the bar. A tooltip that repeats the axis label is wasted.",
        },
        film: [
          {
            title: "Highlight is not filter",
            text: "Highlight keeps every mark and dims the rest. If the user asked to see only that team, they asked for a filter action.",
          },
        ],
        exercises: [
          mc(
            "Click a team bar and the player chart should keep only that team. Which action?",
            ["Filter action", "Highlight action", "URL action", "A new workbook"],
            0,
            "Filter passes the click and drops the other teams. Highlight only fades them.",
          ),
          mc(
            "You want the same eight players available as one toggle on several sheets. What is that list?",
            ["A set", "A tooltip", "A story", "A green continuous axis"],
            0,
            "A set is a saved membership list. Sheets can filter to who is in it.",
          ),
          mc(
            "Hover shows the bar's player name again and nothing else. What should the tooltip carry?",
            ["The same name, larger", "The detail the bar does not show, like week or points per game", "The entire CSV", "Nothing, tooltips are for pictures only"],
            1,
            "A tooltip is for the next question, not a copy of the label.",
          ),
          fill(
            "Position, then player, then week, each nested under the last, is a ",
            [null, "."],
            ["hierarchy", "parameter", "extract"],
            ["hierarchy"],
            "A hierarchy is the drill order. Click in, and you move down that list.",
          ),
        ],
      }),
    ],
  },
  {
    id: "tb-dash",
    number: 5,
    title: "The Page",
    drive: "5th Drive · Goal Line",
    description: "One question on the page, then a URL you can send.",
    skills: ["Dashboard", "Layout", "Tableau Public"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-dash-l1",
        title: "One question on the page",
        blurb: "Layout, size, and color that is not only red and green.",
        brief: {
          goal: "Put sheets on a dashboard that answers one question.",
          setup:
            "A dashboard is a page of sheets, filters, and titles. A worksheet is one chart.",
          steps: [
            {
              title: "Four charts and no sentence",
              body: "A page with every chart you know is a pile. The person opening it cannot tell what to look at.",
            },
            {
              title: "The title is the finding",
              body: "Write the point in the title. 'Chase led the season in points' is a title. 'Dashboard 1' is not. Captions say how to read the filter.",
            },
            {
              title: "Size is a promise",
              body: "Fixed size means the page is a specific pixel width. Automatic size stretches, and things collide on a phone or a projector. Pick the screen they will actually use. Containers are the boxes that hold the sheets so they line up.",
            },
          ],
        },
        intro: {
          title: "Do not use only red and green.",
          text: "Red and green is the usual color pair, and a lot of people cannot tell them apart. Use a light-to-dark scale of one hue, or blue and orange, and write the number as well as the color.",
        },
        film: [
          {
            title: "A slow dashboard is usually the data, not the pixels",
            text: "A live connection to a huge file, a row-level calculation on every mark, and filters that fire late all add up. An extract is a snapshot Tableau reads faster. Use one when the source is slow and the data does not need to be current to the minute.",
          },
        ],
        exercises: [
          mc(
            "The page has six charts and the title is Dashboard 1. What is the first fix?",
            ["Add a seventh chart", "One question, and a title that states the finding", "Switch to a pie", "Publish it immediately"],
            1,
            "A dashboard is an argument. The title should say the point.",
          ),
          mc(
            "It looked right on your laptop and broke on their monitor. What did you skip?",
            ["The size: fixed versus the screen they use", "The player's real name", "Blue pills", "The semicolon"],
            0,
            "Fixed size is a specific layout. Another screen overflows it. Decide before you decorate.",
          ),
          mc(
            "The only way to read the ranking is red versus green. What fails?",
            ["Nothing, those colors are standard", "People who cannot tell red from green cannot read it", "Public bans color", "Measures cannot be colored"],
            1,
            "Color cannot be the only channel. Add the number, and pick a pair more people can see.",
          ),
          fill(
            "A page that holds several sheets is a ",
            [null, ". One chart by itself is a worksheet."],
            ["dashboard", "parameter", "token"],
            ["dashboard"],
            "Dashboard is the page. Worksheet is one picture on it.",
          ),
        ],
      }),
      lesson({
        id: "tb-dash-l2",
        title: "A URL you can send",
        blurb: "Publish to Tableau Public, and walk the finding in order.",
        brief: {
          goal: "Publish a dashboard someone can open, and know what you must not upload.",
          setup:
            "Tableau Public gives you a profile and a URL. That URL is the portfolio piece.",
          steps: [
            {
              title: "A screenshot is not the dashboard",
              body: "They asked to click. A picture in a slide cannot be filtered. Publish, then send the link.",
            },
            {
              title: "Public means the data goes with it",
              body: "Saving to Tableau Public uploads the data the chart uses. Use the season file from this site, not a private league. Strip salaries if they are not yours to publish.",
            },
            {
              title: "A story is a sequence of pages",
              body: "A story walks the same dashboard, or a few sheets, one caption at a time. Use it when the finding has an order: the leaderboard, then the week the lead changed, then the caveat.",
            },
          ],
        },
        intro: {
          title: "The profile is the portfolio.",
          text: "A hiring manager who asks for Tableau work will open your Public profile. One finished dashboard with a sentence of context beats five unnamed experiments.",
        },
        film: [
          {
            title: "Name the file like a finding",
            text: "'2024 wide receiver points, and who kept it up' is a workbook name. 'Book1' is not. The name is what the profile page shows.",
          },
        ],
        exercises: [
          mc(
            "You finished the season dashboard and want a hiring manager to click it. What do you send?",
            ["A screenshot", "The Tableau Public URL", "The raw CSV only", "A description with no link"],
            1,
            "The point of the dashboard is that they can use it. The URL is the work.",
          ),
          mc(
            "The workbook still has the private league's auction prices. What do you do before Public?",
            ["Publish it, passwords are implied", "Take the private columns out first", "Rename the file", "Turn the filters off"],
            1,
            "Public uploads the data behind the view. Private prices do not go up.",
          ),
          mc(
            "You need to show the finding in three beats: who led, when it flipped, and the caveat. What is that sequence?",
            ["A story", "One more filter", "A dual axis", "A calculated field"],
            0,
            "A story is ordered captions over the views. It is the walkthrough, not another chart type.",
          ),
          fill(
            "The free public web address for a workbook comes from Tableau ",
            ["Tableau ", null, "."],
            ["Public", "measure", "LOD"],
            ["Public"],
            "Publish to Tableau Public and the profile holds the link.",
          ),
        ],
      }),
    ],
  },
  {
    id: "tb-job",
    number: 6,
    title: "Job-Ready Tableau",
    drive: "6th Drive · End Zone",
    description: "Fix the data before the chart, then narrate the dashboard.",
    skills: ["Relationships", "Extracts", "Portfolio"],
    status: "live",
    lessons: [
      lesson({
        id: "tb-job-l1",
        title: "Fix it before the chart",
        blurb: "Joins, relationships, and a snapshot of the data.",
        brief: {
          goal: "Choose how two tables meet, and when to snapshot them.",
          setup:
            "A relationship keeps the tables and lets the view decide the grain. A join makes one table at a grain you might regret.",
          steps: [
            {
              title: "The names do not match",
              body: "One file says 'Justin Jefferson'. Another says 'J. Jefferson'. Tableau will not guess that those are the same player. Clean the names before you ask a chart to join them.",
            },
            {
              title: "Relationship, join, or blend",
              body: "A relationship links two tables and aggregates each at its own grain, so a team's games are not copied once per player. A join glues rows together first, and a one-to-many join can duplicate points. A blend is the older, weaker link between two separate sources. Prefer a relationship unless you truly need one flat table.",
            },
            {
              title: "Live or extract",
              body: "Live means Tableau asks the source every time. An extract is a snapshot it reads locally, which is faster and still your data until you refresh it. Use an extract when the source is slow. Use live when the number has to be current.",
            },
          ],
        },
        intro: {
          title: "Do the cleanup in SQL or the file.",
          text: "A calculated field that trims names on every click is the slow, fragile place to fix data. Fix the list, then chart it.",
        },
        film: [
          {
            title: "A duplicated total is usually a join",
            text: "If a team's points equal the sum of its players and also got multiplied by the number of games in another table, the join copied rows. Check the grain before you blame the measure.",
          },
        ],
        exercises: [
          mc(
            "Player points doubled after you joined a games table that has many rows per player. What happened?",
            ["The measure is green", "The join copied each player once per matching game", "Public rounded up", "A parameter did it"],
            1,
            "A one-to-many join repeats the left row. Sums then count the same points more than once.",
          ),
          mc(
            "You want player points and team names, each totaled at its own grain, without flattening first. Which link?",
            ["A relationship", "A blend of two CSVs with no key", "Paste into one cell", "A tooltip"],
            0,
            "A relationship keeps both grains. A join collapses them first.",
          ),
          mc(
            "The warehouse is slow and yesterday's numbers are fine. What do you use?",
            ["A live connection you refresh every mark", "An extract", "A story", "A pie"],
            1,
            "An extract is a snapshot. It is the right speed trade when the data can be slightly old.",
          ),
          fill(
            "A snapshot Tableau reads locally, instead of asking the source every time, is an ",
            [null, "."],
            ["extract", "action", "hierarchy"],
            ["extract"],
            "Extract is the local copy. Live asks the source again.",
          ),
        ],
      }),
      lesson({
        id: "tb-job-l2",
        title: "Say why you built it that way",
        blurb: "The interview is the narration, not the screenshot.",
        brief: {
          goal: "Walk someone through a dashboard without reading the shelves at them.",
          setup:
            "They will ask what the question was, why this chart, and what you would not trust.",
          steps: [
            {
              title: "Show the question before the clicks",
              body: "Start with who it is for and what decision it supports. Then the picture. Then the filter you expect them to touch. Then the caveat: one huge week, a missing game, a public data limit.",
            },
            {
              title: "A take-home is a screenshot plus a file",
              body: "The classic exercise is: here is a picture of a dashboard, rebuild it. Match the question, the ranking, and the filters. Extra charts that were not asked for read as nerves.",
            },
          ],
        },
        intro: {
          title: "One public dashboard is the portfolio.",
          text: "Profile, one finished URL, a sentence on the data source, and a sentence on what you would not conclude. That is the piece people actually open.",
        },
        film: [
          {
            title: "Critique someone else's by the same list",
            text: "Can you tell the question? Are the axes labeled? Does color do more than decorate? Does a total survive the filter they advertised? That is the review.",
          },
        ],
        exercises: [
          mc(
            "An interviewer says, walk me through this. What do you say first?",
            ["The hex codes", "Who it is for and what question it answers", "Every calculated field, in order", "That Tableau is better than everything"],
            1,
            "The audience and the question. The shelves are how, not the opening.",
          ),
          mc(
            "A take-home shows a leaderboard filtered to wide receivers. You add four extra charts. What does that do?",
            ["Proves range", "Burys the thing they asked to see", "Is required to publish", "Turns it into a model"],
            1,
            "Rebuild the ask. Extra charts compete with the finding.",
          ),
          mc(
            "What belongs next to a Public URL in a portfolio?",
            ["Nothing", "Where the data came from, and what the page should not be used to conclude", "Your desktop license key", "The full private salary file"],
            1,
            "Source and caveat. The link is not self-explanatory to a stranger.",
          ),
          fill(
            "The line you say before you describe the chart is the ",
            [null, " the page answers."],
            ["question", "color", "extract"],
            ["question"],
            "Start with the question. The chart is the answer.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-start",
    number: 1,
    title: "What Power BI Is",
    drive: "1st Drive · Own 25",
    description: "What this course is, then the three views in one file.",
    skills: ["Desktop", "Service", "Report view"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-start-l1",
        title: "The report the company already uses",
        blurb: "What this course is, and which Power BI is free.",
        brief: {
          goal: "Know what Power BI is for, and which piece you install.",
          setup:
            "Power BI Desktop is a free Windows app. The Service is the website a published report lives on. This site does not run Power BI.",
          steps: [
            {
              title: "What you're here to do",
              body: "A lot of companies already share numbers in Power BI. This course is how you build that kind of report: a page, a model behind it, and formulas that respect the filters. Football scores are the practice list.",
            },
            {
              title: "What to expect",
              body: "Lessons are a few minutes each. You answer questions about the ideas. You build the file yourself in Power BI Desktop. A miss shows why. This browser cannot open the app.",
            },
            {
              title: "Where this course sits",
              body: "Business Analyst takes this after Excel and SQL. BI Analyst often takes it with Tableau. The product is called Power BI. Excel is the grid. Power BI is the report other people refresh.",
            },
            {
              title: "Desktop and Service are different places",
              body: "Desktop is where you build the file. It is free, and it runs on Windows. The file ends in .pbix. The Service is the website where you publish so other people can open it. Sharing inside a company usually needs a license. A public web publish is a separate, narrower option.",
            },
          ],
        },
        intro: {
          title: "Mac can view. Windows builds.",
          text: "You can open a published report in a browser on a Mac. Building and changing the .pbix is a Desktop job, and Desktop is Windows. Plan for that before the first lesson that says open the app.",
        },
        film: [
          {
            title: "The file is the product",
            text: "A .pbix holds the report, the cleaning steps, and the model. Losing the file means losing the work, not just a picture.",
          },
        ],
        exercises: [
          mc(
            "You need to build a report on a Windows laptop and you have no budget. What do you install?",
            ["Power BI Desktop", "Only the Service", "Tableau Desktop", "Nothing — this site is Power BI"],
            0,
            "Desktop is the free Windows app you build in. This course does not run it.",
          ),
          mc(
            "Coworkers need to open the report on Monday without your laptop. Where does it live?",
            ["Only on your Desktop", "The Service, after you publish", "In a screenshot", "In the CSV"],
            1,
            "Service is the hosted report. Desktop is your build machine.",
          ),
          mc(
            "The file you save is called a…",
            [".pbix", ".csv", "a worksheet pill", "a prompt"],
            0,
            "The Power BI file is a .pbix. It holds the report and the model.",
          ),
          fill(
            "You build on Windows in Power BI ",
            ["Power BI ", null, ". You publish to the Service."],
            ["Desktop", "measure", "pie"],
            ["Desktop"],
            "Desktop is the free Windows app. Service is where others open the report.",
          ),
        ],
      }),
      lesson({
        id: "pb-start-l2",
        title: "Three views, one file",
        blurb: "Report, data, and model — and the field that arrived as text.",
        brief: {
          goal: "Know which view you are in, and not trust an imported type.",
          setup:
            "Report is the page. Data is the tables. Model is how the tables connect.",
          steps: [
            {
              title: "You are drawing before the tables are connected",
              body: "The first visual is easy and then the filter does nothing. You were in the report view, and you never checked the model.",
            },
            {
              title: "The three icons are the whole app",
              body: "Report view is the canvas. Data view is the rows. Model view is the diagram of tables and the lines between them. Same file. You will move among all three.",
            },
            {
              title: "A field type can be wrong",
              body: "Power BI guesses. A points column that arrived with spaces is text, and it will not sum. The little icon next to the field says text, number, or date. Change it before you chart it. On the report, one visual of points by player is the same first chart as everywhere else.",
            },
          ],
        },
        intro: {
          title: "If it will not sum, it is text.",
          text: "Look at the field icon. ABC means text. A sum that is missing usually means the column was imported as text, often because of a blank or a stray space.",
        },
        film: [
          {
            title: "The Fields pane is the column list",
            text: "Drag a field onto the canvas and you get a visual. The pane is not the data. It is the list of names the model is willing to use.",
          },
        ],
        exercises: [
          mc(
            "You need to see whether two tables are connected. Which view?",
            ["Report view", "Model view", "A tooltip", "The published URL only"],
            1,
            "Model view is the diagram. Report view is the page. Data view is the rows.",
          ),
          mc(
            "Points will not sum. The icon beside the field says ABC. What happened?",
            ["Points are a title", "The column came in as text", "Desktop is the Service", "You need a pie"],
            1,
            "ABC is text. A number that still has spaces or a blank often imports as text.",
          ),
          mc(
            "You want to read a single row of the player table. Which view?",
            ["Data view", "Only model view", "The license page", "A parameter"],
            0,
            "Data view shows the rows. Model view shows the links.",
          ),
          fill(
            "The canvas where you place visuals is the ",
            [null, " view."],
            ["report", "model", "service"],
            ["report"],
            "Report view is the page. Model and data are the other two.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-query",
    number: 2,
    title: "Power Query",
    drive: "2nd Drive · Own 40",
    description: "The cleaning steps get written down, then rerun.",
    skills: ["Power Query", "Unpivot", "Merge"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-query-l1",
        title: "The steps are the recipe",
        blurb: "Change a column, and Monday's refresh does it again.",
        brief: {
          goal: "See Power Query as a saved list of transforms.",
          setup:
            "Power Query is the cleaning window. Each click becomes a step. Refresh reruns the list.",
          steps: [
            {
              title: "You cleaned it by hand last week",
              body: "You deleted a blank row, trimmed a name, and the next export undid all of it. The cleanup lived in the file, not in a recipe.",
            },
            {
              title: "Each click is a step",
              body: "Power Query records the transforms in order: remove the blank rows, trim the names, set the type. Refresh runs that list against the new file. You do not reclean by hand.",
            },
          ],
        },
        intro: {
          title: "The Applied Steps list is the work.",
          text: "If a step is wrong, delete or edit that step. Do not start a second copy of the query and hope. The list is the documentation.",
        },
        film: [
          {
            title: "Refresh breaks when the file moves",
            text: "The first step is usually the path to the CSV. Rename the file or the column, and Monday's refresh fails at that step. Read the step name. It tells you which assumption broke.",
          },
        ],
        exercises: [
          mc(
            "You trimmed names today. Next week's export has the same extra spaces. What reruns the trim?",
            ["You, by hand", "Refresh, which replays the steps", "A chart title", "Publishing alone, with no query"],
            1,
            "The steps are the recipe. Refresh is how the next file gets the same treatment.",
          ),
          mc(
            "Refresh failed and the error names the first step. What is the usual cause?",
            ["The color theme", "The file path or a column name changed", "You used a bar chart", "The Service deleted the model"],
            1,
            "The source step points at a path and columns. Move them, and that step is the one that dies.",
          ),
          mc(
            "Where should the blank header row be removed?",
            ["In a visual title", "As a step in Power Query", "In a tooltip", "Only after publishing"],
            1,
            "Cleaning belongs in the query, so the next refresh does it too.",
          ),
          fill(
            "The list of transforms Power Query will rerun is the ",
            [null, "."],
            ["steps", "theme", "slicer"],
            ["steps"],
            "Applied steps are the recipe. Refresh plays them in order.",
          ),
        ],
      }),
      lesson({
        id: "pb-query-l2",
        title: "Wide, long, and two files",
        blurb: "Unpivot a season grid. Append a year. Merge a name.",
        brief: {
          goal: "Tell unpivot, append, and merge apart.",
          setup:
            "Wide means one column per week. Long means one row per player-week. Charts and models want long.",
          steps: [
            {
              title: "The sheet has Week1, Week2, Week3 as columns",
              body: "You cannot filter to one week, because week is not a column. It is a set of headers.",
            },
            {
              title: "Unpivot turns headers into rows",
              body: "Unpivot keeps the player column and melts the week columns into two: the week name, and the points. One row per player per week. That shape is what a filter expects.",
            },
            {
              title: "Append stacks. Merge matches.",
              body: "Append puts 2023 under 2024 when the columns match. Merge brings the team name onto the scoring rows by matching the player. Merge is the join. Append is the union.",
            },
          ],
        },
        intro: {
          title: "Set the type after the shape is right.",
          text: "Points that unpivot as text still will not sum. Change type to a decimal number after the unpivot, not before you know which column is the value.",
        },
        film: [
          {
            title: "A parameter can point at this year's file",
            text: "The source path can be a parameter, so next season you change one text value instead of rebuilding the query. The steps stay.",
          },
        ],
        exercises: [
          mc(
            "Columns are named Week 1 through Week 17. You need one row per player-week. Which transform?",
            ["Unpivot", "A pie chart", "Delete the player column", "A report title"],
            0,
            "Unpivot melts those week columns into rows. After that, week is a value you can filter.",
          ),
          mc(
            "2023 and 2024 are two files with the same columns. You want one table. Which?",
            ["Append", "Merge on a key that will duplicate points", "Unpivot the year", "A slicer"],
            0,
            "Append stacks matching tables. Merge is for bringing columns over by a match.",
          ),
          mc(
            "Scoring rows have a player. A second table has the team. You want the team on each scoring row. Which?",
            ["Merge", "Append", "Unpivot the team", "Hide the table"],
            0,
            "Merge matches rows and adds columns. That is a join.",
          ),
          fill(
            "Stacking two seasons with the same columns is an ",
            [null, ". Matching a team onto each player is a ", null, "."],
            ["append", "merge", "unpivot", "theme"],
            ["append", "merge"],
            "Append stacks. Merge matches.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-model",
    number: 3,
    title: "The Model",
    drive: "3rd Drive · Midfield",
    description: "One table of events, small tables of the things those events are about.",
    skills: ["Star schema", "Relationships", "Date table"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-model-l1",
        title: "Don't chart one giant paste",
        blurb: "A fact table and the small tables around it.",
        brief: {
          goal: "Say what a star schema is, in terms of games and players.",
          setup:
            "A fact is an event you count. A dimension describes something that shows up on many events.",
          steps: [
            {
              title: "One pasted sheet with everything",
              body: "Player, team, points, salary, week, and owner, copied into one wide table. Filters get slow and the same team name is spelled three ways.",
            },
            {
              title: "Events in the middle",
              body: "A fact table is the events: one row per player-game, with the points. A dimension is the thing you describe once: the player, the team, the week. The picture looks like a star: fact in the middle, dimensions around it. That shape is a star schema.",
            },
          ],
        },
        intro: {
          title: "The line between tables is a relationship.",
          text: "Player on the fact matches player on the player table. Many games, one player row. That is one-to-many. The filter starts on the one side and keeps the matching games.",
        },
        film: [
          {
            title: "Two-way filters get ambiguous fast",
            text: "A relationship can filter both directions. It feels convenient and then a total counts the wrong rows, because both tables are trying to filter each other. Keep the arrow pointing from the dimension to the fact unless you have a specific reason.",
          },
        ],
        exercises: [
          mc(
            "One row per player-game, with the points. What is that table?",
            ["A fact", "A color theme", "A slicer", "A tooltip"],
            0,
            "Facts are the events you aggregate. Games and their points are the fact.",
          ),
          mc(
            "The player table has one row per player: name, position, team. What is that?",
            ["A dimension", "A fact", "A measure", "An error"],
            0,
            "A dimension describes the thing. The fact points at it many times.",
          ),
          mc(
            "Many games point at one player row. Which relationship?",
            ["One-to-many, from player to games", "Many-to-many with no key", "No line, filters will guess", "A merge that copies the points"],
            0,
            "One player, many games. Filter from the player side.",
          ),
          fill(
            "The events table in the middle of the star is the ",
            [null, " table."],
            ["fact", "theme", "slicer"],
            ["fact"],
            "Fact holds the events. Dimensions sit around it.",
          ),
        ],
      }),
      lesson({
        id: "pb-model-l2",
        title: "A real calendar",
        blurb: "Time comparisons need a date table, not the dates hiding in the fact.",
        brief: {
          goal: "Know why a date table exists, and what to hide.",
          setup:
            "Time comparisons want one continuous calendar, marked as a date table.",
          steps: [
            {
              title: "Year to date is blank",
              body: "You asked for season-to-date and got nothing, or a number that skips weeks. The only dates in the model are the weeks someone played. Missed weeks are holes.",
            },
            {
              title: "Build a date table",
              body: "A date table is one row per day, or per week, with no gaps, for the seasons you care about. Mark it as the model's date table and relate it to the fact. Time math uses that table, not the holes in the fact.",
            },
            {
              title: "Hide the keys people should not drag",
              body: "The player id on the fact is for the relationship, not for the report. Hide it. Leave the name on the dimension. A model someone else can use is mostly about what you hide.",
            },
          ],
        },
        intro: {
          title: "Write down what each table is.",
          text: "One sentence per table: grain, and where it came from. The next person, often you in two months, cannot recover that from the diagram alone.",
        },
        film: [
          {
            title: "Cross-filter is how a click travels",
            text: "Click a team and the fact rows for other teams drop. That happens because the relationship carries the filter. If a visual does not respond, the relationship is missing or pointed the wrong way.",
          },
        ],
        exercises: [
          mc(
            "Season-to-date skipped the weeks a player sat out. Dates only exist on rows that have points. What is missing?",
            ["A date table with no gaps", "Another pie", "A public license", "A tooltip"],
            0,
            "Time math needs a continuous calendar. The fact's dates have holes where nobody played.",
          ),
          mc(
            "The player id is on the fact and on the player table. What do you show on the report?",
            ["The id, on the fact", "The name, from the player table, and hide the id", "Both, in every visual", "Neither"],
            1,
            "The id is the relationship. The name is what a person reads. Hide the key.",
          ),
          mc(
            "A team slicer does not change the points visual. What do you check?",
            ["The theme color", "Whether a relationship connects the team table to the fact", "The report title", "Whether Desktop is Windows"],
            1,
            "A click filters across a relationship. No line, no travel.",
          ),
          fill(
            "One row per day, no gaps, related to the fact, is a ",
            [null, " table."],
            ["date", "fact", "theme"],
            ["date"],
            "A date table is the calendar. The fact only has the days something happened.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-dax",
    number: 4,
    title: "DAX",
    drive: "4th Drive · Red Zone",
    description: "A measure listens to the filters. A column does not.",
    skills: ["Measure", "CALCULATE", "DIVIDE"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-dax-l1",
        title: "A formula that hears the filter",
        blurb: "Calculated columns versus measures.",
        brief: {
          goal: "Put the season total in a measure, not a stored column.",
          setup:
            "DAX is the formula language. A measure is computed when the visual asks. A calculated column is stored on each row.",
          steps: [
            {
              title: "You stored the season total on every row",
              body: "You added a column, total points, copied onto every game. Filter to week 1 and the column still shows the whole season. It was saved before the filter existed.",
            },
            {
              title: "A column is per row. A measure listens.",
              body: "A calculated column is computed once per row and stored. A measure is a formula that runs under the filters on the visual. Points for this team, this week, is a measure. DAX is the language both are written in.",
              note: "Excel formulas live in a cell. A measure does not have a cell. It has whatever filters are in play. That surrounding filters is called filter context.",
            },
          ],
        },
        intro: {
          title: "SUM of points is a measure.",
          text: "Total Points = SUM(Games[Points]). Drop it on a card with a team filter and it totals that team. The same formula on an unfiltered card totals everyone. You did not write two formulas.",
          code: "Total Points = SUM ( Games[Points] )",
        },
        film: [
          {
            title: "Row context is one row at a time",
            text: "A calculated column can see the row it sits on. A measure cannot, unless you iterate. SUMX walks the rows, does something on each, and adds. Plain SUM does not walk. It aggregates the column under the current filters.",
          },
        ],
        exercises: [
          mc(
            "Week filter is on, and the 'total' still shows the whole season. Where did you write it?",
            ["A calculated column, stored before the filter", "A measure", "A slicer title", "The date table"],
            0,
            "A column is saved per row. It does not recompute when the visual's filters change.",
          ),
          mc(
            "You want one formula that shows team points, or week points, depending on the visual. What is it?",
            ["A measure", "A column copied onto every row", "A renamed file", "A theme"],
            0,
            "A measure is evaluated under the filters of the visual that asks for it.",
          ),
          mc(
            "SUMX is different from SUM because SUMX…",
            ["Ignores numbers", "Walks row by row, then adds", "Only works in Excel", "Publishes the report"],
            1,
            "SUMX is an iterator. SUM aggregates the column under the current filters.",
          ),
          fill(
            "A formula that runs under the visual's filters is a ",
            [null, "."],
            ["measure", "column", "theme"],
            ["measure"],
            "Measures listen to filters. Calculated columns are stored per row.",
          ),
        ],
      }),
      lesson({
        id: "pb-dax-l2",
        title: "Change the filters, then compute",
        blurb: "CALCULATE, a percent of everything, and a divide that does not explode.",
        brief: {
          goal: "Use CALCULATE to change which rows a measure sees.",
          setup:
            "CALCULATE evaluates a measure under a different set of filters. DIVIDE is the safe split.",
          steps: [
            {
              title: "Percent of the whole, while a team is selected",
              body: "The card shows the team's points. You also want that number as a share of every team. The team filter is on, so a plain sum only sees one team.",
            },
            {
              title: "CALCULATE swaps the filter",
              body: "CALCULATE runs a measure under filters you name. ALL on the team field removes the team filter for that one measure, so the denominator is everybody. The numerator still sees the team. That pair is the percent.",
            },
            {
              title: "Do not divide by an empty cell",
              body: "A player with no games makes points per game blow up. DIVIDE returns a blank instead of an error when the bottom is zero or blank. Use it for rates.",
            },
          ],
        },
        intro: {
          title: "VAR names a step so you can read it.",
          text: "VAR Points = SUM(Games[Points]) stores that number for the rest of the measure. RETURN is the result. Same answer, easier to read, and the sum is not computed twice.",
          code: "Share =\nVAR Part = SUM ( Games[Points] )\nVAR Whole =\n    CALCULATE ( SUM ( Games[Points] ), ALL ( Teams ) )\nRETURN DIVIDE ( Part, Whole )",
        },
        film: [
          {
            title: "RELATED pulls a column across the relationship",
            text: "Inside a calculated column on the fact, RELATED can read the team name from the player table. It follows the relationship. It is not a lookup you type by hand.",
          },
        ],
        exercises: [
          mc(
            "The visual is filtered to one team. You need the sum of all teams as the denominator. Which function changes the filters?",
            ["CALCULATE", "A chart title", "RELATEDTABLE spelling only", "Unpivot"],
            0,
            "CALCULATE evaluates the measure under filters you specify. ALL removes the team filter for that denominator.",
          ),
          mc(
            "Games is blank, and points per game shows an error. What do you use?",
            ["A slash and hope", "DIVIDE", "A pie", "Hide the measure and ignore it"],
            1,
            "DIVIDE returns blank when the denominator is zero or blank, instead of an error.",
          ),
          mc(
            "You wrote the same SUM three times in one measure. What makes it readable?",
            ["VAR, then RETURN", "Three calculated columns", "A slicer", "Publishing"],
            0,
            "VAR names an intermediate result. RETURN is what the measure shows.",
          ),
          fill(
            "The function that evaluates a measure under different filters is ",
            [null, "."],
            ["CALCULATE", "unpivot", "append"],
            ["CALCULATE"],
            "CALCULATE is how you change filter context for one formula.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-report",
    number: 5,
    title: "The Report",
    drive: "5th Drive · Goal Line",
    description: "Slicers, a detail page, and a report that looks finished.",
    skills: ["Slicer", "Drillthrough", "Formatting"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-report-l1",
        title: "One control, every page",
        blurb: "Slicers, and a right-click into the detail.",
        brief: {
          goal: "Filter every page from one slicer, and drill into one player.",
          setup:
            "A slicer is the filter control on the canvas. Drillthrough is a page you land on from a right-click.",
          steps: [
            {
              title: "You built the same filter three times",
              body: "Page one has a team dropdown. Page two forgot it. The user thinks the report disagrees with itself.",
            },
            {
              title: "A slicer can be synced",
              body: "A slicer is a visible filter. Sync it and the same choice applies on the other pages. Do not make them hunt for a second copy.",
            },
            {
              title: "Right-click is a page",
              body: "Drillthrough is a page that receives the player you right-clicked. The summary stays uncluttered. The detail page is allowed to be dense, because they asked for it.",
            },
          ],
        },
        intro: {
          title: "Same chart rules as everywhere else.",
          text: "Bars for a ranking, a line for weeks, a dot per player when you are comparing two numbers. The tool changed. The question still picks the picture.",
        },
        film: [
          {
            title: "Bookmarks are saved views",
            text: "A bookmark remembers which filters and which visuals were showing. A button can jump to that bookmark. That is how a report gets a simple menu, instead of thirty visuals at once.",
          },
        ],
        exercises: [
          mc(
            "Team should filter page 1 and page 2 together. What do you set up?",
            ["Two unrelated dropdowns", "One slicer, synced", "A new fact table", "A pie on each page"],
            1,
            "A synced slicer is one choice applied to the pages you name.",
          ),
          mc(
            "The summary is a leaderboard. The user wants that player's weeks without crowding the first page. What do you add?",
            ["A drillthrough page", "Every week as a tooltip of all players", "A second report file", "A calculated column of the URL"],
            0,
            "Drillthrough opens a detail page for the row they clicked.",
          ),
          mc(
            "You want a button that returns the report to the unfiltered leaderboard. What remembers that view?",
            ["A bookmark", "An unpivot", "A date table", "The file extension"],
            0,
            "A bookmark stores the view. A button can go there.",
          ),
          fill(
            "The visible filter sitting on the canvas is a ",
            [null, "."],
            ["slicer", "fact", "VAR"],
            ["slicer"],
            "A slicer is the control. Sync it when the choice should cross pages.",
          ),
        ],
      }),
      lesson({
        id: "pb-report-l2",
        title: "Make it readable",
        blurb: "Labels, a heat map that is still a table, and one theme.",
        brief: {
          goal: "Format a report so the number can be read without a legend scavenger hunt.",
          setup:
            "Conditional formatting colors a table by the value. A theme is the shared color and font.",
          steps: [
            {
              title: "The bars are right and still hard to read",
              body: "No units, a legend far from the line, and three typefaces. The finding is there and nobody stays.",
            },
            {
              title: "Put the unit on the label",
              body: "Points, not a naked axis. Titles that state the finding, same as any other chart. Color a table from low to high when they need to scan a grid. That color is conditional formatting. It does not replace the number.",
            },
          ],
        },
        intro: {
          title: "One theme, then stop decorating.",
          text: "Pick the theme before the last visual, not after each chart invents a palette. Consistency is what makes a three-page report feel like one report.",
        },
        film: [
          {
            title: "A report-page tooltip is a tiny page",
            text: "Hover can show a small page you designed, not only a list of fields. Use it for the extra chart. Do not use it to hide the main number.",
          },
        ],
        exercises: [
          mc(
            "A table of weekly points should be scannable, and the number still has to be readable. What do you add?",
            ["Conditional formatting, and leave the numbers", "Color only, and remove the numbers", "A pie per cell", "Twelve fonts"],
            0,
            "Color helps scanning. The number has to stay, because color is not enough.",
          ),
          mc(
            "Page two uses a different font and a different blue than page one. What did you skip?",
            ["A theme", "A date table", "CALCULATE", "Unpivot"],
            0,
            "A theme is the shared look. Set it once.",
          ),
          mc(
            "The axis says 400 with no word for what 400 is. What is missing?",
            ["The unit, points", "Another slicer", "A relationship arrow", "The license"],
            0,
            "Label the unit. A number without a unit is a guessing game.",
          ),
          fill(
            "Coloring cells by their value, while keeping the number, is conditional ",
            ["conditional ", null, "."],
            ["formatting", "unpivot", "append"],
            ["formatting"],
            "Conditional formatting is the heat on a table. It does not replace the value.",
          ),
        ],
      }),
    ],
  },
  {
    id: "pb-job",
    number: 6,
    title: "Job-Ready Power BI",
    drive: "6th Drive · End Zone",
    description: "Who can see which rows, and how this differs from Tableau.",
    skills: ["RLS", "Service", "DAX interviews"],
    status: "live",
    lessons: [
      lesson({
        id: "pb-job-l1",
        title: "Who is allowed to see it",
        blurb: "Row-level security, the Service, and a slow visual.",
        brief: {
          goal: "Restrict rows by viewer, and find the visual that is slow.",
          setup:
            "Row-level security is a filter the viewer's identity applies. Performance Analyzer times each visual.",
          steps: [
            {
              title: "Every owner can see every salary",
              body: "The report is right, and it is still a problem. Jordan should see Jordan's team, not Riley's auction prices.",
            },
            {
              title: "The model can filter by who opened it",
              body: "Row-level security, RLS, is a role: this person only gets the rows where owner equals their name. You test it in Desktop as that role before you publish. It is not a visual filter they can clear.",
            },
            {
              title: "Publishing is a workspace",
              body: "The Service organizes reports into workspaces. An app is a packaged set of reports you give to a group. Version control of the .pbix is still mostly the file in Git or a shared drive. The format does not merge the way code does. Be honest about that in an interview.",
            },
          ],
        },
        intro: {
          title: "Performance Analyzer names the slow visual.",
          text: "Start the recorder, open the page, and read which visual took the time. It is often one measure that removes too many filters, or a visual at the wrong grain.",
        },
        film: [
          {
            title: "A take-home is a spec",
            text: "They describe the pages and the measures. Rebuild those, not a gallery. CALCULATE shows up because they want to see that you know filters change the number.",
          },
        ],
        exercises: [
          mc(
            "Managers should only see their own team's rows, and they must not be able to clear that limit. What is that?",
            ["A slicer", "Row-level security", "A bookmark they can ignore", "A tooltip"],
            1,
            "RLS is applied by role. It is not a slicer on the page.",
          ),
          mc(
            "One visual takes seconds and the rest are fine. Where do you look first?",
            ["Performance Analyzer", "The theme", "The file extension", "A pie chart of load times you guess"],
            0,
            "Performance Analyzer times the visuals. Start there instead of rewriting the whole model.",
          ),
          mc(
            "Someone asks how you version-control a .pbix. What is the honest answer?",
            ["It merges like source code", "You can store the file, but it does not merge cleanly the way code does", "Power BI forbids saving", "The Service deletes the last version every night"],
            1,
            "You can keep the file in Git or a drive. You cannot review a pretty diff of the model. Say that plainly.",
          ),
          fill(
            "A role that limits which rows a person can see is ",
            [null, "."],
            ["RLS", "VAR", "unpivot"],
            ["RLS"],
            "RLS is row-level security. Test the role before you publish.",
          ),
        ],
      }),
      lesson({
        id: "pb-job-l2",
        title: "Tableau or Power BI",
        blurb: "The honest comparison, for the interview and the path.",
        brief: {
          goal: "Say when each tool is the one the job actually uses.",
          setup:
            "They are both dashboards. The job post tells you which one the team runs.",
          steps: [
            {
              title: "Do not memorize a winner",
              body: "Tableau is the one a lot of analyst portfolios are built in, and it is common on posts that say visualization. Power BI is the one a Microsoft shop already paid for, and DAX is the part they test.",
            },
            {
              title: "What transfers",
              body: "Star schema, grain, filters, one question per page, honest color. Those are the same. What does not transfer is the formula language and where the file gets published. Learn the ideas once. Learn the product the posting names.",
            },
          ],
        },
        intro: {
          title: "If the post says DAX, they mean Power BI.",
          text: "If the post says a public portfolio, Tableau Public is the faster way to show the work. If the post says Microsoft 365, Power BI is the one they will open on Monday.",
        },
        film: [
          {
            title: "The capstone is a multi-page report",
            text: "A fact of games, a player dimension, a date table, measures for points and points per game, a leaderboard, and a drillthrough. That is the piece. A pile of visuals without a model is not.",
          },
        ],
        exercises: [
          mc(
            "The posting says Microsoft 365 and asks about DAX. Which tool do you show?",
            ["Power BI", "Only Tableau Public", "A spreadsheet with no model", "A pie chart in a slide"],
            0,
            "DAX is Power BI's formula language. The stack in the post is the one to show.",
          ),
          mc(
            "The posting wants a link they can click, and it does not mention Microsoft. What is a solid portfolio piece?",
            ["A Tableau Public URL with the question in the title", "An unpublished .pbix you cannot send", "A list of tool names", "Private salaries on the public web"],
            0,
            "A public URL they can filter is the piece. Do not publish data you do not have the right to share.",
          ),
          mc(
            "Which skill moves from Tableau to Power BI without a rewrite?",
            ["The click names of every button", "Grain, a star schema, and one question per page", "FIXED versus CALCULATE syntax", "The .pbix extension"],
            1,
            "The model and the page are the same ideas. The formula spelling is not.",
          ),
          fill(
            "The formula language Power BI interviews actually test is ",
            [null, "."],
            ["DAX", "SQL", "CSS"],
            ["DAX"],
            "DAX is the language. CALCULATE is the function they keep asking about.",
          ),
        ],
      }),
    ],
  },
  {
    id: "ai-how",
    number: 1,
    title: "What the Model Is Doing",
    drive: "1st Drive · Own 25",
    description: "What this course is, then why a fluent answer can be invented.",
    skills: ["Next token", "Hallucination", "Context"],
    status: "live",
    lessons: [
      lesson({
        id: "ai-how-l1",
        title: "It continues the text",
        blurb: "What this course is, and what a model is actually doing.",
        brief: {
          goal: "Explain a language model without treating it as a lookup.",
          setup:
            "This course is judgment. The site does not call a model for you. A model continues text. It does not look the answer up.",
          steps: [
            {
              title: "What you're here to do",
              body: "These tools are useful, and they invent things in a confident voice. This course is how you use them as an analyst: what to ask, what to check, and what never to paste in. Football questions are the practice.",
            },
            {
              title: "What to expect",
              body: "Short lessons. You read a situation and decide. There is no model running behind the answer key. A miss shows why the fluent reply was still the wrong thing to trust.",
            },
            {
              title: "Where this course sits",
              body: "Take it after you can check a number, in SQL or in stats. The skill is not a product name. A language model is a system that guesses the next piece of text, called a token, given the text so far.",
            },
            {
              title: "Picture finishing a sentence",
              body: "Someone writes 'The player who led 2024 in points was' and the model continues with a name. It continues because that name is a likely next piece, not because it opened the season file and checked.",
            },
          ],
        },
        intro: {
          title: "A token is a chunk, not always a word.",
          text: "The model reads and writes tokens. A long paste can be cut off because the context window, the amount of text it can see at once, is finite. The end of your notes may never have been read.",
        },
        film: [
          {
            title: "Training, fine-tuning, and prompting are different levers",
            text: "Training is how the model was built. Fine-tuning is more training on a narrower pile. Prompting is the text you send at question time. You will almost always only control the prompt.",
          },
        ],
        exercises: [
          mc(
            "The model names a scoring leader. What did it do?",
            ["Opened the season file and checked", "Continued the text with a likely next piece", "Ran your SQL", "Refused, because sports are facts"],
            1,
            "It predicts the next token. A likely name is not a checked fact.",
          ),
          mc(
            "You pasted a 40-page export and the answer ignores the last pages. What limit is that?",
            ["The context window", "The chart color", "Row-level security", "A calculated column"],
            0,
            "The model only sees so much text at once. The rest is not in the question.",
          ),
          mc(
            "Which lever do you actually pull on an ordinary Tuesday?",
            ["Retrain the model", "The prompt you send", "The company's data center", "The token dictionary"],
            1,
            "Prompting is the text you write. Training is not your lever.",
          ),
          fill(
            "The chunk of text the model reads and writes is a ",
            [null, "."],
            ["token", "measure", "slicer"],
            ["token"],
            "A token is the piece. It is not always one word.",
          ),
        ],
      }),
      lesson({
        id: "ai-how-l2",
        title: "Fluent is not checked",
        blurb: "Hallucination, temperature, and what to hand it.",
        brief: {
          goal: "Name why a model invents, and which jobs to keep.",
          setup:
            "A hallucination here means a confident statement that was not in the source and is not true. Temperature turns randomness up or down.",
          steps: [
            {
              title: "It cited a game that was never played",
              body: "The sentence was grammatical. The week was wrong. Nothing in the tool blinked, because grammar is not a check.",
            },
            {
              title: "It is built to continue, not to abstain",
              body: "When the text so far does not determine the next fact, the model still picks a likely continuation. That invented fact is a hallucination. Asking it to be careful reduces how often, and does not reduce it to never.",
            },
            {
              title: "Some jobs fit, some do not",
              body: "It is useful for a first draft, a restatement, and a list of things to check. It is a bad calculator, a bad source of record, and a bad person to make the call. Temperature near zero makes repeats more similar. It does not make them true.",
            },
          ],
        },
        intro: {
          title: "You pay for tokens and you wait for the reply.",
          text: "Longer prompts and longer answers cost more and take longer. Choosing a smaller, faster model is a real trade when the task is a tidy rewrite and not a hard reading.",
        },
        film: [
          {
            title: "Model names go stale",
            text: "The specific product changes every few months. The failure does not: likely text is not a checked fact. Learn the failure, not a brand ranking.",
          },
        ],
        exercises: [
          mc(
            "The write-up quotes a score from a week the player did not play. The prose is clean. What happened?",
            ["A hallucination: a likely sentence that was not checked", "The model queried your database", "Temperature of zero guarantees truth", "The context window proved it"],
            0,
            "Continuing text can invent a fact. Clean grammar is not evidence.",
          ),
          mc(
            "Which job do you keep for yourself?",
            ["A first draft of a paragraph you will edit", "The final arithmetic in a report", "The decision to recommend a player", "A fact you have not looked up"],
            0,
            "Drafts are a fit. The number, the call, and the unchecked fact are yours.",
          ),
          mc(
            "You set the sampling so answers barely vary. What did you change, and what did you not get?",
            ["Lower temperature, and you did not get truth", "A larger context, and you got a citation", "A date table, and you got proof", "RLS, and you got accuracy"],
            0,
            "Temperature changes variety. It does not look anything up.",
          ),
          fill(
            "A confident claim that was never in the source is a ",
            [null, "."],
            ["hallucination", "measure", "extract"],
            ["hallucination"],
            "Hallucination is the invented continuation. Fluency does not save it.",
          ),
        ],
      }),
    ],
  },
  {
    id: "ai-prompt",
    number: 2,
    title: "Asking Well",
    drive: "2nd Drive · Own 40",
    description: "Say the job, show a sample, change one thing at a time.",
    skills: ["Prompt", "Few-shot", "JSON"],
    status: "live",
    lessons: [
      lesson({
        id: "ai-prompt-l1",
        title: "Tell it the shape",
        blurb: "The question, the context, and the format of the reply.",
        brief: {
          goal: "Write a prompt that names the output, not just the topic.",
          setup:
            "A prompt is the text you send. Specific means the reader could grade the reply.",
          steps: [
            {
              title: "'Analyze this' came back as a pep talk",
              body: "You pasted a table and said analyze. You got adjectives. You never said what decision the paragraph is for, or how long it should be.",
            },
            {
              title: "Three things, said out loud",
              body: "What you want, the context it is allowed to use, and the constraints on the reply. 'Five bullets, each a player and a points-per-game figure from the table below, no player who is not in the table' is a prompt. 'Thoughts?' is not.",
            },
          ],
        },
        intro: {
          title: "Ask for the shape.",
          text: "If you need a heading, three bullets, and a caveat, say that. A role line like 'you are an analyst writing for a coach' changes tone. It does not create a source.",
        },
        film: [
          {
            title: "A bad prompt is vague or unbounded",
            text: "No format, no source, and a request to be creative is how you get a fictional week. Critique the prompt before you critique the model.",
          },
        ],
        exercises: [
          mc(
            "Which prompt can you grade?",
            ["Thoughts on the season?", "From the table below, list the top 3 by points. Do not add players who are not listed. One line each.", "Be insightful.", "Tell me everything."],
            1,
            "A checkable prompt names the source, the count, and the rule against inventing rows.",
          ),
          mc(
            "You asked for a paragraph and wanted a table. What did you forget?",
            ["The output shape", "The model's training date", "A slicer", "A star schema"],
            0,
            "Ask for the format. A table does not appear because you were thinking of one.",
          ),
          mc(
            "A role line ('write as an analyst') does what?",
            ["Checks the facts", "Changes tone, and does not add a source", "Opens the database", "Sets row-level security"],
            1,
            "Role is voice. It is not evidence.",
          ),
          fill(
            "The text you send the model is the ",
            [null, "."],
            ["prompt", "extract", "fact"],
            ["prompt"],
            "The prompt is the request, including the table you paste and the format you demand.",
          ),
        ],
      }),
      lesson({
        id: "ai-prompt-l2",
        title: "Show one, then change one",
        blurb: "An example beats a paragraph of rules. Edit the prompt, not five things at once.",
        brief: {
          goal: "Use one example, and iterate the prompt on purpose.",
          setup:
            "Few-shot means you include an example of the output. One change at a time tells you what helped.",
          steps: [
            {
              title: "The rules were long and the output still drifted",
              body: "You wrote a policy. The reply ignored half of it. A single example of the line you wanted would have been shorter and clearer.",
            },
            {
              title: "Show the shape",
              body: "Few-shot means a couple of examples in the prompt. 'Like this: Jefferson — 18.7 per game, from the table' teaches the punctuation and the rule better than adjectives do.",
            },
            {
              title: "Change one thing",
              body: "If you rewrite the whole prompt after a bad reply, you will not know which sentence fixed it. Keep the last prompt. Change the example, or the count, or the source line. Not all three.",
            },
          ],
        },
        intro: {
          title: "JSON is for a reply a program will read.",
          text: "If the next step is code, ask for a JSON object with named fields, and say not to add prose around it. A paragraph that contains a number is hard to parse. A field called points_per_game is not.",
        },
        film: [
          {
            title: "Step by step helps some tasks",
            text: "Asking the model to list the rows it used, before the conclusion, makes a wrong inclusion easier to spot. It is still not a proof. You check the list.",
          },
        ],
        exercises: [
          mc(
            "The format keeps coming back wrong. What do you add before you add more rules?",
            ["One example of the exact line you want", "A longer role paragraph", "A request to be more creative", "A second model name"],
            0,
            "An example shows the shape. More adjectives rarely do.",
          ),
          mc(
            "The reply improved, but you changed the example, the length, and the source in one edit. What can you conclude?",
            ["All three were required", "Not much — you cannot tell which change mattered", "The model is now correct", "Temperature fell"],
            1,
            "One change at a time. Otherwise you cannot keep the sentence that worked.",
          ),
          mc(
            "A script will read the answer. What do you ask for?",
            ["A witty paragraph", "JSON with named fields and no extra prose", "A story", "A chart title only"],
            1,
            "Named fields are something code can read. A paragraph is something you cannot reliably split.",
          ),
          fill(
            "Putting an example of the output in the prompt is called ",
            [null, "-shot."],
            ["few", "zero", "table"],
            ["few"],
            "Few-shot means you showed examples. Zero-shot means you only described the job.",
          ),
        ],
      }),
    ],
  },
  {
    id: "ai-analyst",
    number: 3,
    title: "On the Job",
    drive: "3rd Drive · Midfield",
    description: "SQL you have not run is not done. Arithmetic is not the model's job.",
    skills: ["Verify SQL", "Drafts", "Limits"],
    status: "live",
    lessons: [
      lesson({
        id: "ai-analyst-l1",
        title: "Run the query",
        blurb: "A generated query is a draft until you execute it.",
        brief: {
          goal: "Treat model-written SQL as unread until it runs on the real tables.",
          setup:
            "The model will happily write SELECT against tables you do not have. Running it is the check.",
          steps: [
            {
              title: "The query looked right",
              body: "It used SUM and GROUP BY and a player name. It also used a column this database does not have. You would have seen that in one run.",
            },
            {
              title: "Never ship unread SQL",
              body: "Read it. Run it. Compare the row count and a total you can spot-check against a number you already trust. If the model explained someone else's query, run that too before you repeat the explanation.",
            },
          ],
        },
        intro: {
          title: "Give it the error, not only the question.",
          text: "Debugging works better when the prompt includes the exact error text, the query, and what one row of the table means. 'It broke' is not context.",
        },
        film: [
          {
            title: "Explaining code is the everyday win",
            text: "Paste a query you did not write and ask what each line returns. Then run it and see if the explanation matches the rows. That habit is worth more than asking it to invent the query.",
          },
        ],
        exercises: [
          mc(
            "The model wrote a query for week_results and used a column called yards. What do you do before you trust the number?",
            ["Paste the number into the report", "Run it, and see that the column is not there", "Ask it if it is sure", "Lower the temperature and republish"],
            1,
            "Run it. A column this table does not have fails, and that failure is the check. 'Are you sure?' is not.",
          ),
          mc(
            "You want help with a query that errored. What belongs in the prompt?",
            ["The query, the exact error, and what one row means", "Just 'fix this'", "The error code with no query", "A request to guess the schema"],
            0,
            "The model cannot see your screen. The error and the grain are the context.",
          ),
          mc(
            "It explains a teammate's query in a way that sounds right. What confirms the explanation?",
            ["The tone", "Running the query and matching the rows to the explanation", "Asking for more confidence", "A longer role line"],
            1,
            "The rows decide. The explanation is a claim about the rows.",
          ),
          fill(
            "Model-written SQL is a draft until you ",
            [null, " it."],
            ["run", "publish", "hide"],
            ["run"],
            "Run it against the real tables. Unread SQL does not go in the report.",
          ),
        ],
      }),
      lesson({
        id: "ai-analyst-l2",
        title: "Not the calculator",
        blurb: "Draft the words. Do the math yourself. Say what you used.",
        brief: {
          goal: "Keep arithmetic and final judgment out of the model.",
          setup:
            "A summary drops detail. A draft is allowed to be a draft. The number in the report has to come from a query you ran.",
          steps: [
            {
              title: "It averaged the weeks and got a tidy number",
              body: "You can add the five weeks yourself in a second. Do that. Do not cite the model's average. Arithmetic is a bad job to hand over, because a wrong total looks exactly like a right one.",
            },
            {
              title: "Words, yes. The call, no.",
              body: "A first draft of the paragraph is a fair use, if you check every figure against the query and you say the draft had help. Categorizing a pile of messy notes is a fair use if you check a sample. Deciding who to start is not a fair use. That call is yours.",
            },
          ],
        },
        intro: {
          title: "A summary leaves things out.",
          text: "Ask what was omitted, and read the source for the caveat. A short paragraph can drop the missing games that made a rate look high.",
        },
        film: [
          {
            title: "Verification is the job skill",
            text: "Spot-check names against the table, rerun the math, and keep the query. Someone who can describe a time the model was wrong, and what they did next, is who the work is safe with.",
          },
        ],
        exercises: [
          mc(
            "The model says the five-week average is 14.0. You have the five numbers. What do you publish?",
            ["14.0, because it was confident", "The average you compute yourself", "Both, and call them different facts", "Nothing ever, averages are banned"],
            1,
            "Do the arithmetic. The model's total is not a source.",
          ),
          mc(
            "Which task is a reasonable thing to delegate, then check?",
            ["A first draft you will edit against the query", "Which player the team should start", "A fact you will not look up", "The final percent in the deck, unchecked"],
            0,
            "Drafts and messy labels, checked by you, are the fit. The decision and the unchecked number are not.",
          ),
          mc(
            "A summary of the injury note dropped the sentence about the missed games. What habit catches that?",
            ["Trust a shorter summary more", "Read the source for what the summary left out", "Ask it to be more detailed and publish that", "Raise the temperature"],
            1,
            "Summaries omit. The source is where the omitted caveat still is.",
          ),
          fill(
            "The number in the report has to come from a query you ",
            [null, "."],
            ["ran", "imagined", "styled"],
            ["ran"],
            "You ran it. The model can help you write it. It does not get to be the source of the figure.",
          ),
        ],
      }),
    ],
  },
  {
    id: "ai-api",
    number: 4,
    title: "Building on Your Data",
    drive: "4th Drive · Red Zone",
    description: "A key is a password. The rows have to come from your table.",
    skills: ["API key", "RAG", "System message"],
    status: "live",
    lessons: [
      lesson({
        id: "ai-api-l1",
        title: "The key is a password",
        blurb: "Environment variables, system versus user, and a reply you parse.",
        brief: {
          goal: "Keep an API key out of the file, and know the two message roles.",
          setup:
            "An API key is the secret that lets code call the model and bills that call to you. This course does not make the call.",
          steps: [
            {
              title: "The key was in the notebook you committed",
              body: "Anyone with the repo can spend your account, and the key is in the history even after you delete the line. You have to revoke it, not just edit the file.",
            },
            {
              title: "The secret stays out of the file",
              body: "Put the key in an environment variable, a value the program reads from outside the file. Never paste it into a prompt, a notebook, or a chat. The request you send has roles. A system message sets the standing rules. A user message is this question.",
            },
          ],
        },
        intro: {
          title: "Read the fields, not the prose.",
          text: "The response is an object. The text you want is one field inside it. Printing the whole object and copying by eye is how a wrapper or an error message gets published as the answer.",
        },
        film: [
          {
            title: "Limits and errors are normal",
            text: "A rate limit means you sent too many calls too fast. Your code should wait and retry, and it should fail in a way a person can read. A demo that only works on the happy path is not a tool.",
          },
        ],
        exercises: [
          mc(
            "You committed an API key in a notebook. Deleting the line in the next commit is…",
            ["Enough", "Not enough — revoke the key, because history still has it", "Impossible, Git cannot store secrets", "What the system message is for"],
            1,
            "History keeps the secret. Revoke it, then move new code to an environment variable.",
          ),
          mc(
            "Where does the key live?",
            ["In the prompt, so the model can see it", "In an environment variable, outside the file", "In the chart title", "In Tableau Public"],
            1,
            "An environment variable is read by the program and is not written into the notebook.",
          ),
          mc(
            "You want every reply to refuse players who are not in the pasted table. Where does that standing rule go?",
            ["A system message", "Only in the user's latest typo", "The temperature dial", "The file name"],
            0,
            "The system message is the standing instruction. The user message is this question.",
          ),
          fill(
            "The secret that authorizes an API call is an API ",
            ["API ", null, "."],
            ["key", "token-window", "slicer"],
            ["key"],
            "An API key is a password. It does not go in the repo.",
          ),
        ],
      }),
      lesson({
        id: "ai-api-l2",
        title: "Answer from the table",
        blurb: "Retrieval, then the model writes. The rows are yours.",
        brief: {
          goal: "Describe a question-answering setup that reads your rows first.",
          setup:
            "Retrieval-augmented generation means you fetch the relevant rows, then the model writes using those rows.",
          steps: [
            {
              title: "You asked it about your league and it invented an owner",
              body: "The model has no copy of your league. Unless you put the rows in the question, it will continue from whatever is likely.",
            },
            {
              title: "Fetch, then write",
              body: "You look up the rows that match the question, with SQL or with a search over your notes. You paste those rows into the prompt and tell it to use only them. That pattern is called retrieval-augmented generation, or RAG. The model still does not get a free pass. You can read the rows it was given.",
            },
            {
              title: "A pile of notes can be searched by meaning",
              body: "An embedding turns a sentence into a list of numbers so that similar sentences sit near each other. That is how a search finds a paragraph that does not share the exact word you typed. It is still search. It is not understanding.",
            },
          ],
        },
        intro: {
          title: "Natural language to SQL is a draft query.",
          text: "A bot that turns a question into SQL is useful when the SQL is shown and run, and the rows come back for a person to see. A bot that only shows a sentence is a narrator. Show the query.",
        },
        film: [
          {
            title: "Tools are functions you let it call",
            text: "You can let the model request a function, like 'run this read-only query', and your code decides whether to run it. You do not let it invent the result of the function. Your database returns the rows.",
          },
        ],
        exercises: [
          mc(
            "You want answers about this season's file, not about a likely season. What has to happen first?",
            ["Retrieve the rows, and put them in the prompt", "Ask a vaguer question", "Raise the temperature", "Hide the SQL"],
            0,
            "RAG fetches first. The model writes from what you retrieved, and you can check those rows.",
          ),
          mc(
            "An embedding is…",
            ["A proof the sentence is true", "A list of numbers used to find similar text", "A Power BI measure", "The API key"],
            1,
            "Embeddings are for nearby meaning in a search. They do not check a fact.",
          ),
          mc(
            "A natural-language question became SQL. What do you show the person?",
            ["Only the prose answer", "The query and the rows, then the sentence", "The system message", "The key"],
            1,
            "The query is the check. A sentence with no query is a narrator.",
          ),
          fill(
            "Fetch the rows, then let the model write from those rows. That pattern is ",
            [null, "."],
            ["RAG", "RLS", "DAX"],
            ["RAG"],
            "RAG is retrieval-augmented generation. Retrieval first, generation second.",
          ),
        ],
      }),
    ],
  },
  {
    id: "ai-judge",
    number: 5,
    title: "The Line",
    drive: "5th Drive · End Zone",
    description: "What never goes in the prompt, and code you cannot explain.",
    skills: ["Privacy", "Eval", "Attribution"],
    status: "live",
    lessons: [
      lesson({
        id: "ai-judge-l1",
        title: "What you do not paste",
        blurb: "Other people's data, keys, and a company rule you did not read.",
        brief: {
          goal: "Keep private data and secrets out of a prompt.",
          setup:
            "A prompt is a copy. If the tool stores it or a person can review it, that copy left your machine.",
          steps: [
            {
              title: "The export had real emails",
              body: "You wanted help categorizing feedback, and the file included names and addresses. Pasting it is handing those names to someone else's system.",
            },
            {
              title: "The short list",
              body: "Do not paste passwords, API keys, or another person's private data. A company policy often says what is allowed on which tool, and 'it was faster' is not a policy. If you are not sure, use a fake example with the same shape.",
            },
          ],
        },
        intro: {
          title: "Say when a draft was helped.",
          text: "If a paragraph or a query started in a model, say so when the context expects your own work: a class, a take-home, a published piece. The norm is attribution. Silent use is how people submit code they cannot debug.",
        },
        film: [
          {
            title: "An eval is a tiny answer key",
            text: "Write twenty questions you know the answer to, from your own tables. Run the prompt. Count how many the reply gets right. That list is an eval. Without it, 'it seems better' is a mood.",
          },
        ],
        exercises: [
          mc(
            "The feedback file includes customer emails. You want categories. What do you paste?",
            ["The raw file", "A fake sample with the same shape, or a file you are allowed to share", "The file plus your API key, so it can help more", "The file, and ask it not to remember"],
            1,
            "Other people's private data does not go in the prompt. A fake row with the same columns teaches the shape.",
          ),
          mc(
            "You are not sure the company allows this tool. What do you do?",
            ["Use it, because the deadline is real", "Read the policy, and use a fake example until you know", "Paste less data and skip the policy", "Put the data in the system message, which is private"],
            1,
            "Policy decides. Speed does not. The system message is not a vault.",
          ),
          mc(
            "You changed the prompt and want to know if answers actually improved. What do you run?",
            ["A fixed set of questions you already know the answers to", "One more vague demo", "A higher temperature", "A new theme"],
            0,
            "That set is an eval. A single impressive reply is not a measurement.",
          ),
          fill(
            "A small set of questions with known answers, used to score a prompt, is an ",
            [null, "."],
            ["eval", "extract", "slicer"],
            ["eval"],
            "An eval is the answer key you wrote. Run it when the prompt changes.",
          ),
        ],
      }),
      lesson({
        id: "ai-judge-l2",
        title: "If you cannot explain it",
        blurb: "The interview failure, and the project that shows your rows.",
        brief: {
          goal: "Refuse work you cannot explain, and know what the capstone has to show.",
          setup:
            "Hiring managers ask you to walk through the query. A model cannot attend that conversation.",
          steps: [
            {
              title: "They asked why the join was there",
              body: "You froze. The query was in your portfolio, and you had not run it enough times to say what one row meant. That is the failure mode. The writing was fine. The understanding was missing.",
            },
            {
              title: "The piece you ship",
              body: "A question, the SQL you ran, the rows, and a short note that says a model helped draft the wording or the first query. You can explain every line. If you cannot, it is not done.",
            },
          ],
        },
        intro: {
          title: "Cost is tokens in, tokens out.",
          text: "A production bot gets expensive when every click sends the whole history. Shorter prompts, a smaller model for the easy calls, and not sending the same unchanged notes twice are the ordinary controls. You do not need a forecast of the industry to use those.",
        },
        film: [
          {
            title: "What they ask",
            text: "How do you check it. What did it get wrong recently. What do you refuse to paste. Those three answers matter more than a list of product names.",
          },
        ],
        exercises: [
          mc(
            "A take-home query is in your file and you cannot say what one row means. What is true?",
            ["It is fine if the model wrote it well", "It is not yours yet — run it until you can explain the grain", "Interviews do not ask about queries", "Attribution replaces understanding"],
            1,
            "If you cannot explain the row, you cannot defend the number. Run it until you can.",
          ),
          mc(
            "What belongs in the capstone note?",
            ["The question, the query you ran, and that a model drafted wording", "Only the prose, with the query hidden", "The API key, so they can replay it", "A claim the model checked the facts"],
            0,
            "Show the query and the rows. Say where a draft had help. Do not hide the check.",
          ),
          mc(
            "Which answer holds up in an interview?",
            ["I use AI for everything", "It invented a score last week. I caught it because I ran the query.", "The model is usually right", "I paste production data so the answers are better"],
            1,
            "A specific miss, and the check that caught it, is the answer they can trust.",
          ),
          fill(
            "If you cannot explain what one row means, the query is not ",
            ["not ", null, " yet."],
            ["yours", "published", "green"],
            ["yours"],
            "You own it when you can explain the grain and the number.",
          ),
        ],
      }),
    ],
  },
];
