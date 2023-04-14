import { createSlice } from "@reduxjs/toolkit";
import BlogService from "../services/BlogService";
import { toast } from "react-toastify";
import { addBlogToUser } from "./userReducer";

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    appendBlogs(state, action) {
      return [...state, action.payload];
    },
    setBlogs(state, action) {
      return action.payload;
    },
    updateBlog(state, action) {
      const updatedBlog = action.payload;
      return state.map((blog) =>
        blog.id === updatedBlog.id ? updatedBlog : blog
      );
    },
  },
});

//? asynchronous action creators
/*
 first, an asynchronous operation is executed, 
 after which the action changing the state of 
 the store is dispatched.
*/
export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await BlogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const createBlog = (blog) => {
  return async (dispatch) => {
    const newBlog = await BlogService.addNewBlog(blog);
    dispatch(appendBlogs(newBlog.data));
    dispatch(addBlogToUser(newBlog.data));
  };
};

export const updateBlogLike = (currentBlog) => {
  return async (dispatch) => {
    const updatedBlog = await BlogService.updateBlogLikeCount(currentBlog);
    dispatch(updateBlog(updatedBlog));
  };
};

export const deleteBlogPost = (blogId) => {
  return async (dispatch) => {
    try {
      const deletedBlogResponse = await BlogService.deleteBlogPost(blogId);
      dispatch(initializeBlogs());
      toast.success(deletedBlogResponse.message);
    } catch (err) {
      console.log(err);
      toast.error(`Error deleting blog post.`);
    }
  };
};

export const { appendBlogs, setBlogs, updateBlog } = blogSlice.actions;

export default blogSlice.reducer;
