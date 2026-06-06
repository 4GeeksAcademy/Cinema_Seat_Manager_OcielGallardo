import { runAllScenarios } from "./testScenarios";
import { initializeWebApp } from "./webApp";

if (typeof document !== "undefined") {
	import("./style.css").then((): void => {
		initializeWebApp();
	});
} else {
	runAllScenarios();
}
