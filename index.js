import { Octokit } from "octokit";
import bar from "./bar.js";
import per from "./per.js";

async function main() {
    // username
    const username = process.env.USER_NAME;

    // 레포 가져오기
    const octokit = new Octokit({
        auth: process.env.GH_TOKEN,
    });
    const repos = await octokit
        .request("GET /users/{username}/repos", {
            username: username,
        })
        .then((repos) => repos.data);
    let repoNames = repos.map((data) => data.name);
    repoNames = repoNames.filter((ele) => ele !== `${username}.github.io`);
    // console.log(repoNames);

    // 레포별 언어 가져오기 (병렬 처리)
    let arr = [];
    let check = [];

    const fetchRepoLangs = async (repoName) => {
        let data = await octokit.request(
            `GET /repos/{owner}/${repoName}/languages`,
            {
                owner: username,
                repo: repoName,
            }
        );
        let obj = {};
        obj[repoName] = data.data;
        check.push(obj);
        arr.push(data.data);
    };

    const promises = repoNames.map((repoName) => fetchRepoLangs(repoName));
    await Promise.all(promises);
    // console.log(arr);
    console.log(check);

    // 언어별 정리
    let allLangs = {};

    // 오브젝트의 키가 언어
    for (let obj of arr) {
        for (let lang in obj) {
            if (!(lang in allLangs)) allLangs[lang] = obj[lang];
            else allLangs[lang] += obj[lang];
        }
    }

    // 제외
    delete allLangs["SCSS"];
    delete allLangs["ShaderLab"];
    delete allLangs["Dart"];
    delete allLangs["Shell"];
    delete allLangs["HLSL"];
    delete allLangs["Kotlin"];
    delete allLangs["Objective-C"];
    delete allLangs["Ruby"];

    let arrayLangs = [];

    for (let lang in allLangs) {
        arrayLangs.push(lang);
    }

    arrayLangs.sort((a, b) => allLangs[b] - allLangs[a]);

    let sum = 0;
    for (let lang of arrayLangs) {
        console.log(`${lang} : ${allLangs[lang]}`);
        sum += allLangs[lang];
    }

    console.log(`sum = ${sum}`);

    const byte1 = allLangs[arrayLangs[0]];
    const byte2 = allLangs[arrayLangs[1]];
    const byte3 = allLangs[arrayLangs[2]];
    const byte4 = allLangs[arrayLangs[3]];

    const per1 = per(byte1, sum);
    const per2 = per(byte2, sum);
    const per3 = per(byte3, sum);
    const per4 = per(byte4, sum);

    const bar1 = bar(per1);
    const bar2 = bar(per2);
    const bar3 = bar(per3);
    const bar4 = bar(per4);

    // 템플릿
    const lines = [
        `${"🥕  1st".padEnd(9)} ${arrayLangs[0]
            .toUpperCase()
            .padEnd(12)} ${bar1} ${`${per1.toFixed(1)}`.padStart(5)}%`,
        `${"🥕  2nd".padEnd(9)} ${arrayLangs[1]
            .toUpperCase()
            .padEnd(12)} ${bar2} ${`${per2.toFixed(1)}`.padStart(5)}%`,
        `${"🥕  3th".padEnd(9)} ${arrayLangs[2]
            .toUpperCase()
            .padEnd(12)} ${bar3} ${`${per3.toFixed(1)}`.padStart(5)}%`,
        `${"🥕  4th".padEnd(9)} ${arrayLangs[3]
            .toUpperCase()
            .padEnd(12)} ${bar4} ${`${per4.toFixed(1)}`.padStart(5)}%`,
        `      TOTAL LANGS : ${arrayLangs.length}    TOTAL BYTES : ${sum}`,
    ];

    // 1등
    const most = arrayLangs[0].toUpperCase();
    // gist update
    await octokit.request("PATCH /gists/{gist_id}", {
        gist_id: process.env.GIST_ID,
        description: `🐰 ${most} 없인 못 살아 🐰`,
        files: {
            "Most Used Lang": {
                content: lines.join("\n"),
            },
        },
    });

    console.log("성공!");
}

main();
