// the class acts as the basic component for the node of an octree
class Cuboid {
  constructor(center, halfLength) {
    this.x = center.x
    this.y = center.y
    this.z = center.z
    this.w = halfLength.x
    this.h = halfLength.y
    this.d = halfLength.z
  }

  _isInRange(p, o, range) {
    return (o - range <= p) && (p <= o + range)
  }

  // check if a point is inside this cuboid
  isContainable(point) {
    return (
      this._isInRange(point.x, this.x, this.w) &&
      this._isInRange(point.y, this.y, this.h) &&
      this._isInRange(point.z, this.z, this.d)
    )
  }

  // check if this cuboid is overlapped with the other cuboid
  isOverlapped(other) {
    return (
      this._isInRange(other.x - other.w, this.x, this.w) ||
      this._isInRange(other.x + other.w, this.x, this.w) ||
      this._isInRange(other.y - other.h, this.y, this.h) ||
      this._isInRange(other.y + other.h, this.y, this.h) ||
      this._isInRange(other.z - other.d, this.z, this.d) ||
      this._isInRange(other.z + other.d, this.z, this.d)
    )
  }
}

// the class acts as the node for an octree
class OctreeNode {
  constructor(cuboid, maxPoints) {
    this.cuboid = cuboid
    this.maxPoints = maxPoints
    this.points = new Array()
    this.isDivided = false
    this.I    = undefined // (+, +, +)
    this.II   = undefined // (-, +, +)
    this.III  = undefined // (-, -, +)
    this.IV   = undefined // (+, -, +)
    this.V    = undefined // (+, +, -)
    this.VI   = undefined // (-, +, -)
    this.VII  = undefined // (-, -, -)
    this.VIII = undefined // (+, -, -)
  }

  _branch() {
    let V  = p5.Vector
    let x  = this.cuboid.x
    let y  = this.cuboid.y
    let z  = this.cuboid.z
    let hw = this.cuboid.w / 2
    let hh = this.cuboid.h / 2
    let hd = this.cuboid.d / 2

    this.I    = new OctreeNode(new Cuboid(new V(x + hw, y + hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.II   = new OctreeNode(new Cuboid(new V(x - hw, y + hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.III  = new OctreeNode(new Cuboid(new V(x - hw, y - hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.IV   = new OctreeNode(new Cuboid(new V(x + hw, y - hh, z + hd), new V(hw, hh, hd)), this.maxPoints)
    this.V    = new OctreeNode(new Cuboid(new V(x + hw, y + hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VI   = new OctreeNode(new Cuboid(new V(x - hw, y + hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VII  = new OctreeNode(new Cuboid(new V(x - hw, y - hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
    this.VIII = new OctreeNode(new Cuboid(new V(x + hw, y - hh, z - hd), new V(hw, hh, hd)), this.maxPoints)
  }

  insert(point) {
    if (!this.cuboid.isContainable(point.position)) {
      return
    }

    if (this.points.length < this.maxPoints) {
      this.points.push(point)
    } else {
      if (!this.isDivided) {
        this._branch()
        this.isDivided = true
      }

      this.I.insert(point)
      this.II.insert(point)
      this.III.insert(point)
      this.IV.insert(point)
      this.V.insert(point)
      this.VI.insert(point)
      this.VII.insert(point)
      this.VIII.insert(point)
    }
  }

  search(searchCuboid, points) {
    if (!this.cuboid.isOverlapped(searchCuboid)) {
      return
    }

    for (let point of this.points) {
      if (searchCuboid.isContainable(point.position)) {
        points.push(point)
      }
    }

    if (this.isDivided) {
      this.I.search(searchCuboid, points)
      this.II.search(searchCuboid, points)
      this.III.search(searchCuboid, points)
      this.IV.search(searchCuboid, points)
      this.V.search(searchCuboid, points)
      this.VI.search(searchCuboid, points)
      this.VII.search(searchCuboid, points)
      this.VIII.search(searchCuboid, points)
    }
  }
}

// wrapper class of OctreeNode, provide better utility of octree
class Octree {
  constructor(cuboid, maxPoints) {
    this.root = new OctreeNode(cuboid, maxPoints || 25)
  }

  build(points) {
    for (let point of points) {
      this.root.insert(point)
    }
  }

  search(cuboid) {
    let points = new Array()
    this.root.search(cuboid, points)
    return points
  }
}
