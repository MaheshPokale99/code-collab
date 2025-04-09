import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { langNames } from "@uiw/codemirror-extensions-langs"
import { ChangeEvent, useEffect } from "react"

function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        showGitHubCorner,
        setShowGitHubCorner,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))
    const handleShowGitHubCornerChange = (e: ChangeEvent<HTMLInputElement>) =>
        setShowGitHubCorner(e.target.checked)

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    // Get theme options from the editorThemes object
    const themeOptions = Object.keys(editorThemes)

    return (
        <div
            className="flex flex-col items-center gap-4 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Settings</h1>
            
            {/* Theme selection */}
            <div className="w-full">
                <Select
                    onChange={handleThemeChange}
                    value={theme}
                    options={themeOptions}
                    title="Theme"
                />
            </div>
            
            {/* Font settings */}
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <Select
                        onChange={handleFontFamilyChange}
                        value={fontFamily}
                        options={editorFonts}
                        title="Font Family"
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                        Font Size
                    </label>
                    <select
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="input-field"
                        title="Font Size"
                    >
                        {[...Array(13).keys()].map((size) => (
                            <option key={size} value={size + 12}>
                                {size + 12}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Language selection */}
            <div className="w-full">
                <Select
                    onChange={handleLanguageChange}
                    value={language}
                    options={langNames}
                    title="Language"
                />
            </div>
            
            {/* GitHub corner toggle */}
            <div className="mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-surface/50 p-3 backdrop-blur-sm">
                <label className="text-sm font-medium text-text">Show GitHub Corner</label>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        className="peer sr-only"
                        type="checkbox"
                        onChange={handleShowGitHubCornerChange}
                        checked={showGitHubCorner}
                    />
                    <div className="peer h-6 w-12 rounded-full bg-surface-light outline-none duration-100 after:absolute after:left-1 after:top-1 after:flex after:h-4 after:w-4 after:items-center after:justify-center after:rounded-full after:bg-white after:font-bold after:outline-none after:duration-500 peer-checked:after:translate-x-6 peer-checked:after:border-white peer-focus:outline-none peer-checked:bg-primary"></div>
                </label>
            </div>
            
            {/* Reset button */}
            <button
                className="btn-primary mt-auto w-full"
                onClick={resetSettings}
            >
                Reset to Default
            </button>
        </div>
    )
}

export default SettingsView
