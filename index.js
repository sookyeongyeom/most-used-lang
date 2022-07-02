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

    const bar1 = bar(per(bar1, sum));
    const bar2 = bar(per(bar2, sum));
    const bar3 = bar(per(bar3, sum));
    const bar4 = bar(per(bar4, sum));

    // 템플릿
    const lines = [
        `${"🥕  1st".padEnd(11)} ${arrayLangs[0].toUpperCase().padEnd(10)} ${bar1} ${`${
            allLangs[arrayLangs[0]]
        }`.padStart(10)} bytes  ✨✨✨`,
        `${"🥕  2nd".padEnd(11)} ${arrayLangs[1].toUpperCase().padEnd(10)} ${bar2} ${`${
            allLangs[arrayLangs[1]]
        }`.padStart(10)} bytes`, //
        `${"🥕  3th".padEnd(11)} ${arrayLangs[2].toUpperCase().padEnd(10)} ${bar3} ${`${
            allLangs[arrayLangs[2]]
        }`.padStart(10)} bytes`,
        `${"🥕  4th".padEnd(11)} ${arrayLangs[3].toUpperCase().padEnd(10)} ${bar4} ${`${
            allLangs[arrayLangs[3]]
        }`.padStart(10)} bytes`,
        `     TOTAL LANGS : ${arrayLangs.length}    TOTAL BYTES : ${sum}`,
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
