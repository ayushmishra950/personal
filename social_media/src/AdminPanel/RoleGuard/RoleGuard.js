// RoleGuard.js
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "../../graphql/mutations";
import { GetTokenFromCookie } from '../../components/getToken/GetToken';
import { useEffect, useState } from "react"


const RoleGuard = ({ allowedRoles, children }) => {
     const [token, setToken] = useState(); // Initialize token state
    useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    if(decodedUser?.id){
        setToken(decodedUser);
    }
  }, []);

  const { data, loading, error } = useQuery(ME_QUERY,{ variables: { userId: token?.id }});

  if (loading) return <p>Loading...</p>;
  if (error || !data?.mySelf) return <p>Unauthorized</p>;

  const role = data.mySelf.role;

  if (!allowedRoles.includes(role)) {
    return <p>Access Denied ❌</p>;
  }

  return children;
};

export default RoleGuard;
