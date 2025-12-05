import cn from "clsx";
import React from "react";
import s from "./SpinnerbLoader.module.css";

const SpinnerbLoader = ({ className }: any) => {
	return <span className={cn(s.Loader, {}, className && className)}></span>;
};

export default SpinnerbLoader;
