// Full-width, full-opacity banner that holds a guide message and auto-disappears after a
// duration. Values match showGuideMessage() in src/common/guide_message/GuideMessage.ts.

export interface GuideMessageHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly transform: string;
    readonly padding: string;
    readonly background: string;
    readonly color: string;
    readonly fontSize: string;
    readonly fontWeight: string;
    readonly borderTop: string;
    readonly borderBottom: string;
    readonly boxShadow: string;
    readonly zIndex: string;
    readonly textAlign: string;
}

export function createDefaultGuideMessageHudFrame(): GuideMessageHudFrame {
    return {
        topPercent: '50%',
        leftPercent: '0',
        widthPercent: '100%',
        transform: 'translateY(-50%)',
        padding: '30px 0',
        background: 'rgba(40, 40, 40, 0.9)',
        color: '#fff',
        fontSize: '36px',
        fontWeight: '500',
        borderTop: '2px solid #00ffd0',
        borderBottom: '2px solid #00ffd0',
        boxShadow: '0 0 10px rgba(0, 255, 208, 0.6)',
        zIndex: '1000',
        textAlign: 'center',
    };
}
