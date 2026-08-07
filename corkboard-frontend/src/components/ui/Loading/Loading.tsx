import "./Loading.scss";

interface LoadingProps {
    overlay?: boolean;
}

const Loading = ({ overlay = false }: LoadingProps) => {
    const loader = (
        <div className="loading">
            {Array.from({ length: 4 }).map((_, i) => (
                <div className="line" key={i}></div>
            ))}
        </div>
    );

    if (!overlay) return loader;

    return <div className="loading-overlay">{loader}</div>;
};

export default Loading;
