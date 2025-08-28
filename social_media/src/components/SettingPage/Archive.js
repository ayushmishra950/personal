import React, {useEffect, useState } from "react";
import PageShell from "./PageShell";
import { GET_ARCHIVED_POSTS, GET_ACHIVE_STORIES } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';
import {useQuery,useMutation } from '@apollo/client';


export default function Archive() {
	// Empty data for now - will be loaded from backend in future
	  const [token, setToken] = useState();
	
	const posts = [];
	const stories = [];

	 useEffect(() => {
		  const decodedUser = GetTokenFromCookie();
		  console.log("User Info:", decodedUser);
		  if(decodedUser?.id){
			setToken(decodedUser);
		  }
		}, []);


	  const { data: archivePostsData, refetch: refetchArchivedPosts } = useQuery(GET_ARCHIVED_POSTS, {
		variables: { userId: token?.id?.toString() },
		skip: !token?.id,
		fetchPolicy: 'cache-and-network'
	  });
       console.log(archivePostsData?.getArchivedPosts);


	     const { data: archiveStoryData, refetch: refetchArchivedStory } = useQuery(GET_ACHIVE_STORIES, {
		variables: { userId: token?.id?.toString() },
		skip: !token?.id,
		fetchPolicy: 'cache-and-network'
	  });
       console.log(archiveStoryData?.getStories);
	   
	const [category, setCategory] = useState("posts");

	return (
		<PageShell title="Archive">
			<div style={{ display: 'flex', gap: 0, marginBottom: 24, width: '100%' }}>
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
						fontSize: 16,
						marginRight: 8
					}}
				>
					Posts
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
						fontSize: 16,
						marginLeft: 8
					}}
				>
					Stories
				</button>
			</div>

			{/* Content area */}
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
				{/* Posts Section */}
				{category === "posts" && (
					archivePostsData?.getArchivedPosts?.length > 0 ? (
						archivePostsData.getArchivedPosts.map(post => (
							<div key={post.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
								{post.imageUrl ? (
									<img 
										src={post.imageUrl} 
										alt={post.title || "Archived Post"} 
										style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} 
									/>
								) : post.videoUrl ? (
									<video 
										src={post.videoUrl} 
										alt={post.title || "Archived Post"} 
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
									{post.title || post.caption || "No title"}
								</div>
							</div>
						))
					) : (
						<div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
							<div style={{ fontSize: 18, marginBottom: 8 }}>📦</div>
							<div>No archived posts yet</div>
							<div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
								Archive posts to see them here
							</div>
						</div>
					)
				)}

				{/* Stories Section */}
				{category === "stories" && (
					archiveStoryData?.getStories?.length > 0 ? (
						archiveStoryData.getStories.map(story => (
							<div key={story.id} style={{ width: 150, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8 }}>
								<div style={{ 
									width: '100%', 
									height: 120, 
									borderRadius: 6, 
									overflow: 'hidden',
									border: '3px solid #6c757d'
								}}>
									{story.mediaType === "image" ? (
										<img 
											src={story.mediaUrl || "https://via.placeholder.com/150"} 
											alt="Archived Story" 
											style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
										/>
									) : story.mediaType === "video" ? (
										<video 
											src={story.mediaUrl || "https://via.placeholder.com/150"} 
											alt="Archived Story" 
											style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
											controls={false}
											muted
										/>
									) : (
										<img 
											src="https://via.placeholder.com/150" 
											alt="No media" 
											style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
										/>
									)}
								</div>
								<div style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
									{story.title || 'Story'}
								</div>
							</div>
						))
					) : (
						<div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#666' }}>
							<div style={{ fontSize: 18, marginBottom: 8 }}>📖</div>
							<div>No archived stories yet</div>
							<div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
								Archive stories to see them here
							</div>
						</div>
					)
				)}
			</div>
		</PageShell>
	);
}