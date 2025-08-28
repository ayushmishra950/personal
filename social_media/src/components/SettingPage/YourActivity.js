import React, {useEffect, useState } from "react";
import PageShell from "./PageShell";
import { useQuery } from "@apollo/client"
import { GET_USER_LIKED_REELS, GET_USER_LIKED_VIDEOS, GET_USER_LIKED_POSTS } from "../../graphql/mutations"
import { GET_USER_COMMENTED_REELS, GET_USER_COMMENTED_VIDEOS, GET_USER_COMMENTED_POSTS } from "../../graphql/mutations"
import { GetTokenFromCookie } from '../getToken/GetToken';

export default function YourActivity() {
  const [category, setCategory] = useState("likes");
  const [subCategory, setSubCategory] = useState("reel");
  const [likesMenu, setLikesMenu] = useState(false);
  const [commentsMenu, setCommentsMenu] = useState(false);
      const [token, setToken] = useState();

      useEffect(() => {
            const decodedUser = GetTokenFromCookie();
            console.log("User Info:", decodedUser);
            if(decodedUser?.id){
            setToken(decodedUser);
            }
          }, []);
      
  

    const { data: reelLikeData } = useQuery(GET_USER_LIKED_REELS, { variables: { userId: token?.id } })
    const { data: videoLikeData } = useQuery(GET_USER_LIKED_VIDEOS, { variables: { userId: token?.id } })
    const { data: postLikeData } = useQuery(GET_USER_LIKED_POSTS, { variables: { userId: token?.id } })
const { data: reelCommentData } = useQuery(GET_USER_COMMENTED_REELS, { variables: { userId: token?.id } })
  const { data: videoCommentData } = useQuery(GET_USER_COMMENTED_VIDEOS, { variables: { userId: token?.id } })
  const { data: postCommentData } = useQuery(GET_USER_COMMENTED_POSTS, { variables: { userId: token?.id } })
  // Tab switch par menu band ho jaye
  const handleTab = (tab) => {
    setCategory(tab);
    setSubCategory("reel"); // Reset to reel when switching tabs
    setLikesMenu(false);
    setCommentsMenu(false);
  };

  // Ek time par ek hi menu khule
  const handleLikesMenu = () => {
    setLikesMenu(!likesMenu);
    setCommentsMenu(false);
  };
  const handleCommentsMenu = () => {
    setCommentsMenu(!commentsMenu);
    setLikesMenu(false);
  };

  return (
    <PageShell title="Your Activity" noBorder>
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, width: '100%', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
        <style>{`
          .activity-tab-btn {
            flex: 1;
            padding: 12px 0;
            border-radius: 20px 0 0 20px;
            border: none;
            background: none;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            font-size: 16px;
            margin-right: 8px;
            transition: background 0.2s, color 0.2s;
          }
          .activity-tab-btn.selected {
            background: #007bff;
            color: #fff;
          }
          .activity-tab-btn:last-child {
            border-radius: 0 20px 20px 0;
            margin-right: 0;
            margin-left: 8px;
          }
        `}</style>
        <button
          onClick={() => handleTab("likes")}
          className={`activity-tab-btn${category === "likes" ? " selected" : ""}`}
        >
          Your Likes
        </button>
        <button
          onClick={() => handleTab("comments")}
          className={`activity-tab-btn${category === "comments" ? " selected" : ""}`}
        >
          Your Comments
        </button>
      </div>
      {/* Like/Comment options just below tabs */}
      {category === "likes" && (
        <div style={{ width: '100%', display: 'flex', gap: 32, margin: '0 0 24px 0', justifyContent: 'flex-start', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
          <style>{`
            .activity-type-btn {
              padding: 12px 22px;
              border-radius: 18px;
              border: none;
              background: #f0f4ff;
              color: #2563eb;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
              cursor: pointer;
              transition: background 0.2s, color 0.2s;
              outline: none;
            }
            .activity-type-btn:hover {
              background: #2563eb;
              color: #fff;
            }
            .activity-type-btn.selected {
              background: #2563eb;
              color: #fff;
            }
          `}</style>
          <button 
            className={`activity-type-btn ${subCategory === "reel" ? "selected" : ""}`}
            onClick={() => setSubCategory("reel")}
          >
            Reel
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "post" ? "selected" : ""}`}
            onClick={() => setSubCategory("post")}
          >
            Post
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "video" ? "selected" : ""}`}
            onClick={() => setSubCategory("video")}
          >
            Video
          </button>
        </div>
      )}
      {category === "comments" && (
        <div style={{ width: '100%', display: 'flex', gap: 32, margin: '0 0 24px 0', justifyContent: 'flex-start', background: 'none', boxShadow: 'none', border: 'none', outline: 'none' }}>
          <style>{`
            .activity-type-btn {
              padding: 12px 22px;
              border-radius: 18px;
              border: none;
              background: #f0f4ff;
              color: #2563eb;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.06);
              cursor: pointer;
              transition: background 0.2s, color 0.2s;
              outline: none;
            }
            .activity-type-btn:hover {
              background: #2563eb;
              color: #fff;
            }
            .activity-type-btn.selected {
              background: #2563eb;
              color: #fff;
            }
          `}</style>
          <button 
            className={`activity-type-btn ${subCategory === "reel" ? "selected" : ""}`}
            onClick={() => setSubCategory("reel")}
          >
            Reel
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "post" ? "selected" : ""}`}
            onClick={() => setSubCategory("post")}
          >
            Post
          </button>
          <button 
            className={`activity-type-btn ${subCategory === "video" ? "selected" : ""}`}
            onClick={() => setSubCategory("video")}
          >
            Video
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {/* Likes Section Data */}
        {category === "likes" && (
          <>
            {subCategory === "reel" && reelLikeData?.getUserLikedReels && (
              reelLikeData.getUserLikedReels.map(reel => (
                <div key={reel.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {reel.videoUrl ? (
                    <video 
                      src={reel.videoUrl} 
                      alt="Liked Reel" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                      controls={false}
                      muted
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reel.title || reel.caption || "Reel"}
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "post" && postLikeData?.getUserLikedPosts && (
              postLikeData.getUserLikedPosts.map(post => (
                <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt="Liked Post" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title || post.caption || "Post"}
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "video" && videoLikeData?.getUserLikedVideos && (
              videoLikeData.getUserLikedVideos.map(video => (
                <div key={video.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {video.videoUrl ? (
                    <video 
                      src={video.videoUrl} 
                      alt="Liked Video" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                      controls={false}
                      muted
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {video.title || video.caption || "Video"}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Comments Section Data */}
        {category === "comments" && (
          <>
            {subCategory === "reel" && reelCommentData?.getUserCommentedReels && (
              reelCommentData.getUserCommentedReels.map(reel => (
                <div key={reel.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {reel.videoUrl ? (
                    <video 
                      src={reel.videoUrl} 
                      alt="Commented Reel" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                      controls={false}
                      muted
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reel.title || reel.caption || "Reel"}
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "post" && postCommentData?.getUserCommentedPosts && (
              postCommentData.getUserCommentedPosts.map(post => (
                <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt="Commented Post" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title || post.caption || "Post"}
                  </div>
                </div>
              ))
            )}
            
            {subCategory === "video" && videoCommentData?.getUserCommentedVideos && (
              videoCommentData.getUserCommentedVideos.map(video => (
                <div key={video.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                  {video.videoUrl ? (
                    <video 
                      src={video.videoUrl} 
                      alt="Commented Video" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                      controls={false}
                      muted
                    />
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150" 
                      alt="No media" 
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    />
                  )}
                  <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {video.title || video.caption || "Video"}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}