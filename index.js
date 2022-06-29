import { Octokit, App } from "octokit";

async function main() {
    // 레포 가져오기
    const octokit = new Octokit({
        auth: "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",
    });
    const repos = await octokit
        .request("GET /users/{username}/repos", {
            username: "sookyeongyeom",
        })
        .then((repos) => repos.data);
    const repoNames = repos.map((data) => data.name);

    // 레포별 언어 가져오기 (병렬 처리)
    let arr = [];

    const fetchRepoLangs = async (repoName) => {
        let data = await octokit.request(
            `GET /repos/{owner}/${repoName}/languages`,
            {
                owner: "sookyeongyeom",
                repo: repoName,
            }
        );
        arr.push(data.data);
    };

    const promises = repoNames.map((repoName) => fetchRepoLangs(repoName));
    await Promise.all(promises);
    // console.log(arr);

    // 언어별 정리
    let allLangs = {};

    // 오브젝트의 키가 언어
    for (let obj of arr) {
        for (let lang in obj) {
            if (!(lang in allLangs)) allLangs[lang] = obj[lang];
            else allLangs[lang] += obj[lang];
        }
    }

    let arrayLangs = [];

    for (let lang in allLangs) {
        arrayLangs.push(lang);
    }

    arrayLangs.sort((a, b) => allLangs[b] - allLangs[a]);

    for (let lang of arrayLangs) {
        console.log(`${lang} : ${allLangs[lang]}`);
    }
}

main();
