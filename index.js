import { Octokit } from "octokit";

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

    // 템플릿
    const lines = [
        `👑 ${arrayLangs[0].toUpperCase()}와 ${
            allLangs[arrayLangs[0]]
        } 바이트를 함께했습니다 !`,
        `🥇 ${arrayLangs[1].toUpperCase()} - 정상까지 ${
            allLangs[arrayLangs[0]] - allLangs[arrayLangs[1]]
        } 바이트`, //
        `🥈 ${arrayLangs[2].toUpperCase()} - 정상까지 ${
            allLangs[arrayLangs[0]] - allLangs[arrayLangs[2]]
        } 바이트`,
        `🥉 ${arrayLangs[3].toUpperCase()} - 정상까지 ${
            allLangs[arrayLangs[0]] - allLangs[arrayLangs[3]]
        } 바이트`,
    ];

    // 1등
    const most = arrayLangs[0].toUpperCase();
    // gist update
    await octokit.request("PATCH /gists/{gist_id}", {
        gist_id: "6d3f2c0beabf8115bd4acdb400343891",
        description: `🙋‍♀️ ${most}의 추종자 🙋‍♀️`,
        files: {
            "README.md": {
                content: lines.join("\n"),
            },
        },
    });

    console.log("성공!");
}

main();
