import {
	ButtonItem,
	Navigation,
	PanelSection,
	PanelSectionRow,
	Router,
} from "decky-frontend-lib"
import { useContext, useEffect, useState } from "react"

import BackButton from "../components/backButton"
import LoadingPanel from "../components/loadingPanel"
import { Scrollable, scrollableRef, ScrollArea } from "../components/Scrollable"
import { Report, ShareDeckContext } from "../context"
import { getReports, getSDHQReview } from "../requests"
import { ReportElement } from "./reportElement"
import { SDHQHeader, SDHQReport, SDHQReportElement } from "./sdhqReport"

const GameReports = () => {
	const { selectedGame, setSelectedGame, serverApi } =
		useContext(ShareDeckContext)
	const [loadingSharedeck, setLoadingSharedeck] = useState(true)
	const [loadingSDHQ, setLoadingSDHQ] = useState(true)
	const [sdhqReport, setSdhqReport] = useState<SDHQReport | null>(null)
	const [reports, setReports] = useState<Report[]>([])
	const [selectedReport, setSelectedReport] = useState<Report | null>(null)
	const [selectedSDHQ, setSelectedSDHQ] = useState(false)
	const ref = scrollableRef()

	useEffect(() => {
		if (!serverApi) return
		if (typeof selectedGame?.appId === "number") {
			getReports(selectedGame.appId, serverApi).then((res) => {
				if (res !== undefined) setReports(res)
				setLoadingSharedeck(false)
			})
			getSDHQReview(selectedGame.appId, serverApi, [
				"acf.optimized_and_recommended_settings.steamos_settings",
				"link",
				"acf.optimized_and_recommended_settings.proton_version",
				"acf.optimized_and_recommended_settings.game_settings",
				"acf.optimized_and_recommended_settings.projected_battery_usage_and_temperature",
				"acf.sdhq_rating,excerpt.rendered",
			]).then((res) => {
				if (res !== undefined) setSdhqReport(res as SDHQReport)
				setLoadingSDHQ(false)
			})
		} else {
			setLoadingSharedeck(false)
			setLoadingSDHQ(false)
		}
	}, [selectedGame])

	if (loadingSharedeck || loadingSDHQ)
		return (
			<div>
				<BackButton onClick={() => setSelectedGame(null)} />
				<LoadingPanel />
			</div>
		)

	if (selectedReport) {
		return (
			<div>
				<BackButton onClick={() => setSelectedReport(null)} />
				<Scrollable ref={ref}>
					<ScrollArea scrollable={ref}>
						<PanelSection
							title={selectedGame?.title}
						></PanelSection>
						<ReportElement report={selectedReport} />
					</ScrollArea>
				</Scrollable>
			</div>
		)
	}

	if (selectedSDHQ) {
		return (
			<div>
				<BackButton onClick={() => setSelectedSDHQ(false)} />
				<Scrollable ref={ref}>
					<ScrollArea scrollable={ref}>
						<SDHQReportElement report={sdhqReport!} />
					</ScrollArea>
					<PanelSection>
						<PanelSectionRow>
							<ButtonItem
								layout="below"
								onClick={() => openWeb(sdhqReport!.link)}
							>
								Open in SteamDeckHQ
							</ButtonItem>
						</PanelSectionRow>
					</PanelSection>
				</Scrollable>
			</div>
		)
	}

	return (
		<div>
			<BackButton onClick={() => setSelectedGame(null)} />
			<PanelSectionRow>
				<h2 style={{ marginBottom: "0px", marginTop: "-12px" }}>
					{selectedGame?.title}
				</h2>
			</PanelSectionRow>
			{sdhqReport ? (
				<PanelSection title="SteamDeckHQ">
					<PanelSectionRow>
						<ButtonItem
							layout="below"
							onClick={() => setSelectedSDHQ(true)}
						>
							<SDHQHeader report={sdhqReport} />
						</ButtonItem>
					</PanelSectionRow>
				</PanelSection>
			) : null}
			<PanelSection title="ShareDeck Reports">
				{reports.map((report) => (
					<PanelSectionRow>
						<ButtonItem
							layout="below"
							onClick={() => setSelectedReport(report)}
						>
							{report.playtime} |{" "}
							<small>
								{report.power_draw}w | {report.fps} |{" "}
								{report.graphics_preset}
							</small>
						</ButtonItem>
					</PanelSectionRow>
				))}
				<PanelSectionRow>
					{reports.length === 0
						? "No ShareDeck Reports were found for this game. Maybe you can add one? Check out https://sharedeck.games"
						: "Using your own configuration? Share it at https://sharedeck.games"}
					{/* <ButtonItem
						onClick={() =>
							openWeb(
								SHAREDECK_NEW_REPORT_URL.replaceAll(
									"${appid}",
									selectedGame?.appId?.toString() || ""
								)
							)
						}
						layout="below"
						label={
							reports.length === 0
								? "No Reports were found for this game. Maybe you can add one?"
								: "Using your own configuration? Share it here!"
						}
					>
						Submit Report
					</ButtonItem> */}
				</PanelSectionRow>
			</PanelSection>
		</div>
	)

	return <div></div>
}

export default GameReports

function openWeb(url: string) {
	Navigation.NavigateToExternalWeb(url)
	Router.CloseSideMenus()
}
