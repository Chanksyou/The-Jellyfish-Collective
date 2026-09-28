// Lets ES modules `import ... from 'three'` use the three.js r128 global the apartment page loads,
// so the game and the apartment share one copy of three.js. Add names here if a module needs more.
const T = window.THREE;
export default T;
export const {
  BackSide, Box3, BufferAttribute, BufferGeometry, ByteType, DataTexture, DoubleSide, FloatType, FrontSide,
  Group, IntType, Line3, LineBasicMaterial, Matrix3, Matrix4, Mesh, MeshBasicMaterial, NearestFilter, Object3D,
  Plane, Ray, RedFormat, RedIntegerFormat, RGBAFormat, RGBAIntegerFormat, RGFormat, RGIntegerFormat, ShortType,
  Sphere, Triangle, UnsignedByteType, UnsignedIntType, UnsignedShortType, Vector2, Vector3, Vector4,
} = T;
