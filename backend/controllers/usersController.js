const axios = require("axios");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

async function fetchUserRepos(user, res) {
	try {
		const response = await axios.get(
			`https://api.github.com/search/repositories?q=owner:${user}`,
			{
				headers: {
					Accept: "application/vnd.github.text-match+json",
					Authorization: `Bearer ${TOKEN}`,
				},
			}
		);

		// Extract information from API call
		let total_repo_count = response.data.total_count;
		let total_fork_count = 0;
		let most_used_languages_dict = {};
		let total_size = 0;

		for (let item of response.data.items) {
			total_fork_count += item.forks_count;
			total_size += item.size;
			if (!(item.language in most_used_languages_dict)) {
				most_used_languages_dict[item.language] = 1;
			} else {
				most_used_languages_dict[item.language]++;
			}
		}

		if (total_repo_count > 30) {
			let pageTotal = Math.ceil(total_repo_count / 30);
			let page = 2;
			do {
				const response2 = await axios.get(
					`https://api.github.com/search/repositories?q=owner:${user}&page=${page}`,
					{
						headers: {
							Accept: "application/vnd.github.text-match+json",
							Authorization: `Bearer ${TOKEN}`,
						},
					}
				);
				for (let item of response2.data.items) {
					total_fork_count += item.forks_count;
					total_size += item.size;
					if (!(item.language in most_used_languages_dict)) {
						most_used_languages_dict[item.language] = 1;
					} else {
						most_used_languages_dict[item.language]++;
					}
				}
				page++;
			} while (page <= pageTotal);
		}

		// Convert Dict to Array to Sort (and make frontend life easier)
		let most_used_languages = [];
		for (let i in most_used_languages_dict) {
			if (i === "null") {
				most_used_languages.push([
					"Not Yet Determined ",
					most_used_languages_dict[i],
				]);
			} else {
				most_used_languages.push([i + " ", most_used_languages_dict[i]]);
			}
		}

		average_repo_size =
			Math.round((total_size / total_repo_count + Number.EPSILON) * 100) / 100;

		res.status(200).json({
			total_repo_count,
			total_fork_count,
			most_used_languages,
			average_repo_size,
		});
		console.log(response.data);
	} catch (error) {
		console.error(error);

		if (error.response.status === 422) {
			res.status(422).json({ message: "Validation failed." });
		} else if (error.response.status === 304) {
			res.status(304).json({ message: "Not modified." });
		} else if (error.response.status === 503) {
			res.status(503).json({ message: "Service unavailable." });
		} else {
			res.status(500).json({ message: "Error occurred." });
		}
	}
}

exports.userRepos = (req, res) => {
	fetchUserRepos(req.params.user, res);
};
