import "./SuperAdminUsers.scss";
import { Table } from "../../../ui/Table/Table.tsx";
import { Button } from "../../../ui/Button/Button.tsx";
import { useEffect, useMemo, useState } from "react";
import type { UserSettings } from "../../../../context/auth/types.ts";
import { api } from "../../../../api/api.ts";
import Loading from "../../../ui/Loading/Loading.tsx";
import Modal from "../../../ui/Modal/Modal.tsx";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../ui/Input/Input.tsx";

const SuperAdminUsers = () => {
    const [users, setUsers] = useState<UserSettings[]>([]);
    const [user, setUser] = useState<UserSettings | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const navigate = useNavigate();

    const handleUserDelete = () => {
        api.delete(`users/${user?.id}`).then(() => {
            setUsers(users.filter((u) => u.id !== user?.id));
            setUser(null);
        });
    };

    useEffect(() => {
        api.get("/users").then((response) => setUsers(response.data));
    }, []);

    const filteredUsers = useMemo(() => {
        const query = searchValue.trim().toLowerCase();
        if (!query) return users;
        return users.filter((u) => u.username.toLowerCase().includes(query));
    }, [users, searchValue]);

    if (users.length < 1) {
        return <Loading overlay={true} />;
    }

    return (
        <div className="superadmin-users">
            <Input className="search" placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />

            <Table
                data={filteredUsers}
                columns={[
                    {
                        key: "id",
                        header: "Id",
                        render: (id) => <div>{id}</div>,
                    },
                    {
                        key: "username",
                        header: "Username",
                        render: (name) => <div>{name}</div>,
                    },
                    {
                        key: "role",
                        header: "Role",
                        render: (role) => <div>{role}</div>,
                    },
                    {
                        key: "id",
                        header: "Options",
                        render: (_, row) => (
                            <>
                                <Button icon="edit" variant="icon" color="outlined" size="small" onClick={() => navigate(`${row.id}`)} />
                                <Button icon="trash" variant="icon" color="outlined" size="small" onClick={() => setUser(row)} />
                            </>
                        ),
                    },
                ]}
            />

            {filteredUsers.length < 1 && <div>No records</div>}

            {user && (
                <Modal onClose={() => setUser(null)}>
                    <Modal.Header title={`Delete ${user.username}`} />
                    <Modal.Body>
                        <span>Are you sure you want to delete {user.username}?</span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="red" onClick={handleUserDelete}>
                            Delete
                        </Button>
                        <Button color="secondary" onClick={() => setUser(null)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default SuperAdminUsers;
