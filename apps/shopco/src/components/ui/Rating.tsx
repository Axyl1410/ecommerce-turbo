"use client";

import React from "react";
import {
	type RatingProps,
	Rating as SimpleRating,
} from "react-simple-star-rating";

const Rating = (props: RatingProps) => {
	return <SimpleRating {...props} />;
};

export default Rating;
