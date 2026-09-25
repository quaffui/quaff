import adapter from "@sveltejs/adapter-static";

export default {
  kit: {
    adapter: adapter(),
    files: { lib: process.env.QUAFF_META_TEST_LIB },
  },
};
