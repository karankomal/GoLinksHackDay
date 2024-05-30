import * as yup from "yup";

export const userSchema = yup.object().shape({
	username: yup
		.string()
		.matches(/^[A-Za-z0-9-]*$/, "Please enter valid User Name!")
		.required("User Name is required!"),
});
