import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer";

// Noto Sans from jsDelivr — TTF, supports ₹ rupee symbol
Font.register({
    family: "NotoSans",
    fonts: [
        {
            src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
            fontWeight: 400,
        },
        {
            src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
            fontWeight: 700,
        },
    ],
});

const BRAND = "#1c3990";
const WHITE = "#FFFFFF";
const BLACK = "#111111";
const GRAY = "#555555";
const LGRAY = "#999999";
const BORDER = "#DDEAFF";
const BGPAGE = "#F5F8FF";

const styles = StyleSheet.create({
    page: {
        backgroundColor: BGPAGE,
        fontFamily: "NotoSans",
        fontSize: 10,
        color: BLACK,
    },

    // Header
    header: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 40,
        paddingVertical: 28,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    brandName: {
        fontSize: 20,
        fontWeight: 700,
        color: WHITE,
        letterSpacing: 1,
    },
    brandSub: {
        fontSize: 8,
        color: "#000000",
        marginTop: 3,
        letterSpacing: 1,
    },
    invoiceLabel: {
        fontSize: 8,
        color: "#000000",
        textAlign: "right",
        letterSpacing: 0.8,
    },
    invoiceNumber: {
        fontSize: 13,
        fontWeight: 700,
        color: "000000",
        textAlign: "right",
        marginTop: 3,
    },
    logo: {
        width: "60px",
        height: "60px",
    },

    // Amount strip
    amountStrip: {
        backgroundColor: WHITE,
        borderBottomWidth: 2,
        borderBottomColor: BRAND,
        paddingHorizontal: 40,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountLabel: {
        fontSize: 8,
        color: LGRAY,
        letterSpacing: 1,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 28,
        fontWeight: 700,
        color: BRAND,
    },
    statusBadge: {
        borderWidth: 1.5,
        borderColor: BRAND,
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 700,
        color: BRAND,
        letterSpacing: 1,
    },

    // Body
    body: {
        paddingHorizontal: 40,
        paddingTop: 28,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: 700,
        color: BRAND,
        letterSpacing: 1.5,
        marginBottom: 10,
    },

    // Card
    card: {
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    rowLast: {
        flexDirection: "row",
    },
    cell: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    cellRight: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderLeftWidth: 1,
        borderLeftColor: BORDER,
    },
    cellLabel: {
        fontSize: 7.5,
        color: LGRAY,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    cellValue: {
        fontSize: 11,
        fontWeight: 700,
        color: BLACK,
    },
    cellMono: {
        fontSize: 9,
        color: GRAY,
    },

    // Note
    noteBox: {
        borderLeftWidth: 3,
        borderLeftColor: BRAND,
        backgroundColor: WHITE,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 20,
    },
    noteText: {
        fontSize: 9,
        color: GRAY,
        lineHeight: 1.6,
    },
    noteBold: {
        fontWeight: 700,
        color: BRAND,
    },

    // Footer
    footer: {
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingHorizontal: 40,
        paddingVertical: 16,
        backgroundColor: WHITE,
    },
    footerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    footerSection: {
        flex: 1,
    },
    footerSectionRight: {
        flex: 1,
        alignItems: "flex-end",
    },
    footerHeading: {
        fontSize: 7.5,
        fontWeight: 700,
        color: BRAND,
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    footerText: {
        fontSize: 8,
        color: GRAY,
        lineHeight: 1.5,
    },
    footerDivider: {
        borderTopWidth: 1,
        borderTopColor: BORDER,
        marginVertical: 8,
    },
    footerBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerNote: {
        fontSize: 7.5,
        color: LGRAY,
    },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount) {
    const num = (amount / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    // Use unicode escape so bundlers don't mangle the ₹ glyph
    return "\u20B9" + num;
}

function shortId(id) {
    if (!id) return "N/A";
    return id.length > 22 ? `${id.slice(0, 12)}...${id.slice(-8)}` : id;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentPDF({ payment }) {
    const date = new Date(payment.createdAt);
    const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const status = (payment.status || "Unknown").toUpperCase();

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Image
                            src="/logo.png"   // or full URL
                            style={styles.logo}
                        />
                        <Text style={styles.brandSub}>PAYMENT RECEIPT</Text>
                    </View>

                    <View>
                        <Text style={styles.invoiceLabel}>INVOICE NO.</Text>
                        <Text style={styles.invoiceNumber}>
                            #{shortId(payment.razorpayPaymentId)}
                        </Text>
                    </View>
                </View>

                {/* Amount strip */}
                <View style={styles.amountStrip}>
                    <View>
                        <Text style={styles.amountLabel}>TOTAL AMOUNT PAID</Text>
                        <Text style={styles.amountValue}>{fmt(payment.amount)}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>

                {/* Body */}
                <View style={styles.body}>

                    <Text style={styles.sectionTitle}>TRANSACTION DETAILS</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.cell}>
                                <Text style={styles.cellLabel}>PAYMENT ID</Text>
                                <Text style={styles.cellMono}>{payment.razorpayPaymentId || "N/A"}</Text>
                            </View>
                            <View style={styles.cellRight}>
                                <Text style={styles.cellLabel}>PAYMENT TYPE</Text>
                                <Text style={styles.cellValue}>{payment.type || "N/A"}</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cell}>
                                <Text style={styles.cellLabel}>DATE</Text>
                                <Text style={styles.cellValue}>{dateStr}</Text>
                            </View>
                            <View style={styles.cellRight}>
                                <Text style={styles.cellLabel}>TIME</Text>
                                <Text style={styles.cellValue}>{timeStr}</Text>
                            </View>
                        </View>
                        <View style={styles.rowLast}>
                            <View style={styles.cell}>
                                <Text style={styles.cellLabel}>CURRENCY</Text>
                                <Text style={styles.cellValue}>INR — Indian Rupee</Text>
                            </View>
                            <View style={styles.cellRight}>
                                <Text style={styles.cellLabel}>AMOUNT </Text>
                                <Text style={styles.cellValue}>
                                    {fmt(payment.amount) || "0"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>GATEWAY INFORMATION</Text>
                    <View style={styles.card}>
                        <View style={styles.rowLast}>
                            <View style={styles.cell}>
                                <Text style={styles.cellLabel}>GATEWAY</Text>
                                <Text style={styles.cellValue}>Razorpay</Text>
                            </View>
                            <View style={styles.cellRight}>
                                <Text style={styles.cellLabel}>MODE</Text>
                                <Text style={styles.cellValue}>Online</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>
                            {"This is a system-generated receipt for your payment of "}
                            <Text style={styles.noteBold}>{fmt(payment.amount)}</Text>
                            {". Please retain this document for your records. Payment status: "}
                            <Text style={styles.noteBold}>{status}</Text>
                            {"."}
                        </Text>
                    </View>

                </View>



            </Page>
        </Document>
    );
}