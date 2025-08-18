import { RemoteUser } from "@/types/user"
import { StateField } from "@codemirror/state"
import { EditorView, showTooltip } from "@codemirror/view"

export function tooltipField(users: RemoteUser[]) {
    return StateField.define({
        create: () => getCursorTooltips(users),
        update(tooltips, tr) {
            if (!tr.docChanged && !tr.selection) return tooltips
            return getCursorTooltips(users)
        },
        provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
    })
}

export function getCursorTooltips(users: RemoteUser[]) {
    return users.map((user) => {
        if (!user.typing) {
            return null
        }
        
        const pos = user.cursorPosition || 0

        return {
            pos,
            above: true,
            strictSide: true,
            arrow: true,
            create: () => {
                const dom = document.createElement("div")
                dom.className = "cm-tooltip-cursor"
                dom.innerHTML = `
                    <div class="cursor-user-info">
                        <span class="cursor-username">${user.username}</span>
                        <span class="cursor-typing-indicator">typing...</span>
                    </div>
                `
                return { dom }
            },
        }
    }).filter(Boolean)
}

export const cursorTooltipBaseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-cursor": {
        backgroundColor: "#3b82f6",
        color: "white",
        border: "2px solid #1d4ed8",
        padding: "6px 12px",
        borderRadius: "8px",
        zIndex: "1000",
        fontSize: "12px",
        fontWeight: "500",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "& .cm-tooltip-arrow:before": {
            borderTopColor: "#3b82f6",
        },
        "& .cm-tooltip-arrow:after": {
            borderTopColor: "transparent",
        },
        "& .cursor-user-info": {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
        },
        "& .cursor-username": {
            fontWeight: "600",
            fontSize: "13px",
        },
        "& .cursor-typing-indicator": {
            fontSize: "11px",
            opacity: "0.9",
            fontStyle: "italic",
        },
    },
})
