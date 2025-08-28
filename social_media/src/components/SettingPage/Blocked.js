
// import React, { useState, useEffect } from "react";
// import PageShell from "./PageShell";
// import { GET_ALL_USERS,UNBLOCK_USER } from '../../graphql/mutations';
// import { GetTokenFromCookie } from '../getToken/GetToken';
// import { useQuery,useMutation } from '@apollo/client';

// export default function Blocked() {
//   const dummyBlocked = [
//     { id: 1, name: "Rohit Sharma", reason: "Spamming" },
//     { id: 2, name: "Anjali Verma", reason: "Abusive language" }
//   ];
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [blockUsers, setBlockUsers] = useState([]);
//   const [token, setToken] = useState();
//   const [unblock] = useMutation(UNBLOCK_USER);


//     const { data: blockUsersData, error, refetch: refetchblockUsers } = useQuery(GET_ALL_USERS, {
//     variables: { userId: token?.id?.toString() },
//     skip: !token?.id,
//     fetchPolicy: 'cache-and-network'
//   });
  
//       const unblockHandler = async (userId) => {
//         try {
//           await unblock({
//             variables: {targetUserId : userId, userId : token?.id.toString() },
//           });

//           await refetchblockUsers();
//         }
//         catch(err){
//           console.error('Error unblocking user:', err);
//         }
//       } 

//   useEffect(() => {
//     const decodedUser = GetTokenFromCookie();
//     console.log("User Info:", decodedUser);
//     if (decodedUser?.id) {
//       setToken(decodedUser);
//     }
//   }, []);



//   useEffect(() => {
//     try {
//       if (blockUsersData?.users) {
//         const allBlockedUsers = blockUsersData.users
//           .flatMap(user => user.blockedUsers || [])
//           .filter((value, index, self) =>
//             index === self.findIndex(u => u.id === value.id)
//           );

//         setBlockUsers(allBlockedUsers);
//         console.log("Blocked Users Only:", allBlockedUsers);
//       }
//     } catch (err) {
//       console.error("Error processing blocked users:", err);
//       alert("Something went wrong while loading blocked users. Please try again.");
//     }
//   }, [blockUsersData]);

//   return (
//     <PageShell title="Blocked">
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//         {blockUsers?.map(user => (
//           <div key={user.id} style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             background: '#f8f8f8',
//             borderRadius: 8,
//             padding: 12
//           }}>
//             <div>
//               <div style={{ fontWeight: 'bold' }}>{user.name}</div>
//               <div style={{ color: '#888', fontSize: 13 }}>{user.reason}</div>
//             </div>
//             <div style={{ position: 'relative' }}>
//               <button
//                 onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
//                 style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4 }}
//                 aria-label="More options"
//               >
//                 &#8942;
//               </button>
//               {menuOpen === user.id && (
//                 <div style={{
//                   position: 'absolute',
//                   right: 0,
//                   top: 28,
//                   background: '#fff',
//                   border: '1px solid #ddd',
//                   borderRadius: 6,
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
//                   zIndex: 10
//                 }}>
//                   <button
//                   onClick={()=>{unblockHandler(user.id)}}
//                   style={{
//                     padding: '8px 16px',
//                     background: 'none',
//                     border: 'none',
//                     width: '100%',
//                     textAlign: 'left',
//                     cursor: 'pointer',
//                     color: '#388e3c',
//                     fontWeight: 500
//                   }}>
//                     Unblock
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </PageShell>
//   );
// }










import React, { useState, useEffect } from "react";
import PageShell from "./PageShell";
import { GET_ALL_USERS, UNBLOCK_USER } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import { useQuery, useMutation } from '@apollo/client';

export default function Blocked() {
  const [menuOpen, setMenuOpen] = useState(null);
  const [blockUsers, setBlockUsers] = useState([]);
  const [token, setToken] = useState();
  const [unblock] = useMutation(UNBLOCK_USER);

  // Get user token on component mount
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    if (decodedUser?.id) {
      setToken(decodedUser);
    }
  }, []);

  // GraphQL query to fetch users
  const { data: blockUsersData, error, refetch: refetchblockUsers } = useQuery(GET_ALL_USERS, {
    variables: { userId: token?.id?.toString() },
    skip: !token?.id,
    fetchPolicy: 'cache-and-network'
  });

  // Handle unblocking
  const unblockHandler = async (userId) => {
    try {
      await unblock({
        variables: {
          targetUserId: userId,
          userId: token?.id.toString()
        },
      });
      await refetchblockUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  // Process and filter only current user's blocked users
  useEffect(() => {
    try {
      if (blockUsersData?.users && token?.id) {
        const currentUser = blockUsersData.users.find(user => user.id === token.id);
        const allBlockedUsers = currentUser?.blockedUsers || [];

        setBlockUsers(allBlockedUsers);
        console.log("Blocked Users Only:", allBlockedUsers);
      }
    } catch (err) {
      console.error("Error processing blocked users:", err);
      alert("Something went wrong while loading blocked users. Please try again.");
    }
  }, [blockUsersData, token]);

  return (
    <PageShell title="Blocked">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {blockUsers?.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No users blocked.
          </div>
        )}

        {blockUsers?.map(user => (
          <div key={user.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8f8f8',
            borderRadius: 8,
            padding: 12
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Blocked</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  padding: 4
                }}
                aria-label="More options"
              >
                &#8942;
              </button>

              {menuOpen === user.id && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 28,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => { unblockHandler(user.id); setMenuOpen(null); }}
                    style={{
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#388e3c',
                      fontWeight: 500
                    }}>
                    Unblock
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
