import WidgetCard from "./WidgetCard";

const PROJECTS = [
    { id: 1, name: "Velonic Admin v1", start: "01/01/2015", due: "26/04/2015", status: "Released", assign: "Techzaa Studio" },
    { id: 2, name: "Velonic Frontend v1", start: "01/01/2015", due: "26/04/2015", status: "Released", assign: "Techzaa Studio" },
    { id: 3, name: "Velonic API v2", start: "15/03/2024", due: "01/08/2024", status: "Pending", assign: "Dev Team" },
];

const ProjectsWidget = () => {
    return (
        <WidgetCard title="Projects">
            <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            {["#", "Project Name", "Start Date", "Due Date", "Status", "Assign"].map((h) => (
                                <th key={h} className="text-left text-[11px] font-semibold text-slate-400 px-2.5 py-2 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PROJECTS.map((p) => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="px-2.5 py-2.5 text-slate-500">{p.id}</td>
                                <td className="px-2.5 py-2.5 font-semibold text-slate-700 whitespace-nowrap">{p.name}</td>
                                <td className="px-2.5 py-2.5 text-slate-500 whitespace-nowrap">{p.start}</td>
                                <td className="px-2.5 py-2.5 text-slate-500 whitespace-nowrap">{p.due}</td>
                                <td className="px-2.5 py-2.5">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.status === "Released" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-2.5 py-2.5 text-slate-500 whitespace-nowrap">{p.assign}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </WidgetCard>
    );
}


export default ProjectsWidget;