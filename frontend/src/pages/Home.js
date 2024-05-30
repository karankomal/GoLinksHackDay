import axios from "axios";
import { useFormik } from "formik";
import React, { useState } from "react";
import { userSchema } from "../validations/userSchema";
import "./Home.css";

function Home() {
	const [userRepoData, setUserRepoData] = useState([]);
	const [repoDataFetched, setRepoDataFetched] = useState(false);
	const [errorCode, setErrorCode] = useState(-1);
	const [errorOccurred, setErrorOccurred] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const formik = useFormik({
		initialValues: {
			username: "",
		},
		validationSchema: userSchema,
		onSubmit: (values) => {
			setIsLoading(true);
			setRepoDataFetched(false);
			setErrorOccurred(false);
			axios
				.get(`/ghuser/repos/${formik.values.username}`)
				.then((response) => {
					setUserRepoData(response.data);
					setIsLoading(false);
					setRepoDataFetched(true);
				})
				.catch((error) => {
					setErrorCode(error.response.status);
					setIsLoading(false);
					setErrorOccurred(true);
					console.error(error);
				});
		},
	});

	console.log(userRepoData);

	return (
		<div className="pageContainer">
			<div className="pageTitle">
				<div className="pageTitleText">GitHub User Repository Details</div>
			</div>
			<div className="pageContents">
				<form onSubmit={formik.handleSubmit} className="userForm">
					<input
						type="text"
						placeholder="Enter User Name"
						value={formik.values.username}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						id="username"
						className={
							formik.errors.username && formik.touched.username
								? "input-error"
								: ""
						}
					/>
					{formik.errors.username && formik.touched.username && (
						<p className="error">{formik.errors.username}</p>
					)}
					<button
						className="submitButton"
						onClick={formik.handleSubmit}
						disabled={
							formik.errors.username && formik.touched.username ? true : false
						}
					>
						Find Repository Details!
					</button>
				</form>

				{isLoading ? <p>Loading...</p> : ""}

				{repoDataFetched ? (
					<div className="repoDetails">
						<div className="mainInfo">
							<span className="infoLabel">Total Repository Count: </span>
							<span>{userRepoData.total_repo_count}</span>
						</div>
						<div className="mainInfo">
							<span className="infoLabel">Avg. Repository Size: </span>
							<span>
								{userRepoData.average_repo_size
									.toString()
									.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
								Kb
							</span>
						</div>
						<div className="mainInfo">
							<span className="infoLabel">Total Fork Count: </span>
							<span>{userRepoData.total_fork_count}</span>
						</div>
						<div className="languages">
							<span className="infoLabel Lang">Most Used Languages:</span>
							{userRepoData.most_used_languages.map((language) => (
								<div className="language">
									{language[0]} - {language[1]}
								</div>
							))}
						</div>
					</div>
				) : (
					""
				)}

				{errorOccurred ? (
					errorCode === 422 ? (
						<div>
							A Validation Error Occurred! This user most likely doesn't exist.
						</div>
					) : errorCode === 304 ? (
						<div>A Not Modified Error Occured!</div>
					) : errorCode === 503 ? (
						<div>The Service is Currently Unavailable!"</div>
					) : (
						""
					)
				) : (
					""
				)}
			</div>
		</div>
	);
}

export default Home;
