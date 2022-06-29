import { getRepo } from "./fetcher.js";
import { getLang } from "./fetcher.js";
import { Octokit, App } from "octokit";

async function main() {
    const octokit = new Octokit({
        auth: "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",
    });

    const repos = await octokit.request("GET /users/{username}/repos", {
        username: "sookyeongyeom",
    });

    const repoName = repos.data[1].name;

    const repoLangsObject = await octokit.request(
        `GET /repos/{owner}/${repoName}/languages`,
        {
            owner: "sookyeongyeom",
            repo: repoName,
        }
    );

    const repoLangsData = repoLangsObject.data;

    let allLangs = { C: 10000, Python: 20000 };

    const repoLangs = Object.keys(repoLangsData);

    console.log(repoLangs);

    // 키 있으면 합산
    // 없으면 생성

    for (let lang of repoLangs) {
        if (!(lang in allLangs)) allLangs[lang] = repoLangsData[lang];
        else allLangs[lang] += repoLangsData[lang];
    }

    console.log(allLangs);

    let arrayLangs = [];

    for (let lang in allLangs) {
        arrayLangs.push(lang);
    }

    console.log(arrayLangs);

    arrayLangs.sort((a, b) => allLangs[b] - allLangs[a]);

    console.log(arrayLangs);

    for (let lang of arrayLangs) {
        console.log(`${lang} : ${allLangs[lang]}`);
    }
}

main();
