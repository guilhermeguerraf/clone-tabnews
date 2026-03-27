function status(request, response) {
  response.status(200).json({ hello: "World!" });
}

export default status;
