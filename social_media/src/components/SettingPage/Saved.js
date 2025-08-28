import React, { useState, useEffect } from "react";
import PageShell from "./PageShell";
import { GET_SAVED_POSTS,ALL_SAVED_REELS,GET_USER_LIKED_VIDEOS } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import {useQuery,useMutation } from '@apollo/client';

export default function Saved() {
  const [category, setCategory] = useState("posts");
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [token, setToken] = useState();

   useEffect(() => {
        const decodedUser = GetTokenFromCookie();
        console.log("User Info:", decodedUser);
        if(decodedUser?.id){
          setToken(decodedUser);
        }
      }, []);

    const { data, loading, error, refetch } = useQuery(GET_SAVED_POSTS, {
      variables: {userId : token?.id.toString()}
    });  
  
      const { data: videoData } = useQuery(GET_SAVED_POSTS, { variables: { userId: token?.id } })
       console.log(videoData?.getSavedPosts);

        const { data: savedReelsData, refetch: refetchSavedReels } = useQuery(ALL_SAVED_REELS, {
           variables: { userId: token?.id?.toString() },
         });
       
         console.log(savedReelsData?.allSavedReels);

  // Update saved posts when data is received
  useEffect(() => {
    if (data?.getSavedPosts) {
      setSavedPosts(data.getSavedPosts);
    }
  }, [data]);

  // Update saved reels when data is received
  useEffect(() => {
    if (savedReelsData?.allSavedReels) {
      setSavedReels(savedReelsData.allSavedReels);
    }
  }, [savedReelsData]);

  // Update saved stories (Videos tab) using data from line 27
  useEffect(() => {
    if (videoData?.getSavedPosts) {
      setSavedStories(videoData.getSavedPosts);
    }
  }, [videoData]);

  return (
    <PageShell title="Saved">
      {/* Three category buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, width: '100%' }}>
        <button
          onClick={() => setCategory("posts")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '20px 0 0 20px',
            border: 'none',
            background: category === "posts" ? '#007bff' : '#f0f0f0',
            color: category === "posts" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Posts
        </button>
        <button
          onClick={() => setCategory("reels")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '0',
            border: 'none',
            background: category === "reels" ? '#007bff' : '#f0f0f0',
            color: category === "reels" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Reels
        </button>
        <button
          onClick={() => setCategory("stories")}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: '0 20px 20px 0',
            border: 'none',
            background: category === "stories" ? '#007bff' : '#f0f0f0',
            color: category === "stories" ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Videos
        </button>
      </div>

      {/* Content area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* Posts Section */}
        {/* {category === "posts" && (
          savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                {post.imageUrl ? (
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption || "Saved Post"} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                  />
                ) 
                :
                 post.videoUrl ? (
                  <video 
                    src={post.videoUrl} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                    controls
                    muted
                  />
                  
                ) : (
                  <img 
                    src="https://via.placeholder.com/150" 
                    alt={post.caption || "Saved Post"} 
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                  />
                )}
                <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.caption || "No caption"}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {post.savedAt ? new Date(post.savedAt).toLocaleDateString() : 'Recently saved'}
                </div>
                
              </div>

            ))
          )
           : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>📝</div>
              <div>No saved posts yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark posts to see them here
              </div>
            </div>
          )
        )} */}





          {/* {category === "posts" && (
          savedPosts.length > 0 ? (
            savedPosts.map(post => (
              <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title || "Saved Reel"} 
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                />
                <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title || post.description || "No title"}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {new Date(post.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🎬</div>
              <div>No saved reels yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark reels to see them here
              </div>
            </div>
          )
        )} */}



        {category === "posts" && (() => {
  const imagePosts = savedPosts.filter(post => post.imageUrl); // sirf image waale posts

  return imagePosts.length > 0 ? (
    imagePosts.map(post => (
      <div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
        <img 
          src={post.imageUrl} 
          alt={post.title || "Saved Post"} 
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
        />
        <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title || post.description || "No title"}
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
          {post.savedAt ? new Date(post.savedAt).toLocaleDateString() : 'Recently saved'}
        </div>
      </div>
    ))
  ) : (
    <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
      <div style={{ fontSize: 18, marginBottom: 8 }}>📝</div>
      <div>No saved posts yet</div>
      <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
        Bookmark posts with images to see them here
      </div>
    </div>
  );
})()}


        {/* Reels Section */}
        {category === "reels" && (
          savedReels.length > 0 ? (
            savedReels.map(reel => (
              <div key={reel.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                <video 
                  src={reel.videoUrl || "https://via.placeholder.com/150"} 
                  alt={reel.title || "Saved Reel"} 
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                />
                <div style={{ fontSize: 12, marginTop: 8, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {reel.title || reel.description || "No title"}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {new Date(reel.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🎬</div>
              <div>No saved reels yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark reels to see them here
              </div>
            </div>
          )
        )}

        {/* Stories Section */}
        {/* {category === "stories" && (
          savedStories.length > 0 ? (
            savedStories.map(story => (
              <div key={story.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
                <video 
                  src={story.videoUrl || "https://via.placeholder.com/150"} 
                  alt="Saved Story" 
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
                />
                <div style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
                  Story
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  {new Date(story.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>📖</div>
              <div>No saved stories yet</div>
              <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                Bookmark stories to see them here
              </div>
            </div>
          )
        )} */}


        {category === "stories" && (() => {
  const videoStories = savedStories.filter(story => story.videoUrl); // Sirf video waale stories

  return videoStories.length > 0 ? (
    videoStories.map(story => (
      <div key={story.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
        <video 
          src={story.videoUrl} 
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
          controls
          muted
        />
        <div style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
          Story
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
          {story.savedAt ? new Date(story.savedAt).toLocaleDateString() : 'Recently saved'}
        </div>
      </div>
    ))
  ) : (
    <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
      <div style={{ fontSize: 18, marginBottom: 8 }}>📖</div>
      <div>No saved stories yet</div>
      <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
        Bookmark stories to see them here
      </div>
    </div>
  );
})()}

      </div>
    </PageShell>
  );
}