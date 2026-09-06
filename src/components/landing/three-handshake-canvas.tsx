"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeHandshakeCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  mousePos: { x: number; y: number }; // normalized -1 to 1
}

export function ThreeHandshakeCanvas({
  scrollProgress,
  mousePos,
}: ThreeHandshakeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);
  const mouseRef = useRef(mousePos);

  progressRef.current = scrollProgress;
  mouseRef.current = mousePos;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f14, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ==========================================
    // LIGHTING: Cinematic Dark Fintech Aesthetics
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x0e1726, 1.2);
    scene.add(ambientLight);

    // Primary Teal Rim Light (Lender side)
    const tealLight = new THREE.PointLight(0x2dd4bf, 4.5, 20);
    tealLight.position.set(-6, 3, 4);
    scene.add(tealLight);

    // Secondary Cyan/Blue Rim Light (Borrower side)
    const cyanLight = new THREE.PointLight(0x22d3ee, 4.0, 20);
    cyanLight.position.set(6, -2, 4);
    scene.add(cyanLight);

    // Soft Blue Top Fill
    const topFill = new THREE.DirectionalLight(0x60a5fa, 1.8);
    topFill.position.set(0, 8, 6);
    scene.add(topFill);

    // Center Handshake Climax Light Pulse
    const centerGlow = new THREE.PointLight(0x2dd4bf, 0, 15);
    centerGlow.position.set(0, 0, 2);
    scene.add(centerGlow);

    // ==========================================
    // MATERIALS: Premium Dark Metallic Human Sheen
    // ==========================================
    const skinMaterialLender = new THREE.MeshPhysicalMaterial({
      color: 0x141f2d,
      roughness: 0.32,
      metalness: 0.25,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
      emissive: 0x09262b,
      emissiveIntensity: 0.35,
    });

    const skinMaterialBorrower = new THREE.MeshPhysicalMaterial({
      color: 0x141f2d,
      roughness: 0.32,
      metalness: 0.25,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
      emissive: 0x092233,
      emissiveIntensity: 0.35,
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.2,
    });

    // ==========================================
    // 3D PROCEDURAL ARTICULATED HAND GENERATOR
    // ==========================================
    function createArticulatedHand(isLeft: boolean, material: THREE.Material) {
      const handGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;

      // Forearm / Wrist
      const armGeo = new THREE.CylinderGeometry(0.5, 0.65, 3.2, 24);
      const armMesh = new THREE.Mesh(armGeo, material);
      armMesh.position.set(0, -1.8, 0);
      handGroup.add(armMesh);

      // Wrist joint cuff
      const cuffGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32);
      const cuffMesh = new THREE.Mesh(cuffGeo, jointMaterial);
      cuffMesh.rotation.x = Math.PI / 2;
      cuffMesh.position.set(0, -0.25, 0);
      handGroup.add(cuffMesh);

      // Palm
      const palmGeo = new THREE.BoxGeometry(1.4, 1.6, 0.45, 4, 4, 4);
      // Smooth corners
      const palmMesh = new THREE.Mesh(palmGeo, material);
      palmMesh.position.set(0, 0.7, 0);
      handGroup.add(palmMesh);

      // Fingers configuration: [xOffset, length, thickness]
      const fingersData = [
        { x: -0.45 * sign, len: 1.15, thick: 0.16 }, // Index
        { x: -0.15 * sign, len: 1.35, thick: 0.17 }, // Middle
        { x: 0.15 * sign, len: 1.25, thick: 0.16 },  // Ring
        { x: 0.45 * sign, len: 0.95, thick: 0.14 },  // Pinky
      ];

      const fingerGroups: THREE.Group[] = [];

      fingersData.forEach((f) => {
        const fingerRoot = new THREE.Group();
        fingerRoot.position.set(f.x, 1.5, 0);

        // Proximal Phalanx
        const proxGeo = new THREE.CylinderGeometry(f.thick * 0.9, f.thick, f.len * 0.45, 16);
        const proxMesh = new THREE.Mesh(proxGeo, material);
        proxMesh.position.set(0, (f.len * 0.45) / 2, 0);
        fingerRoot.add(proxMesh);

        // Knuckle 1
        const k1Geo = new THREE.SphereGeometry(f.thick * 1.05, 16, 16);
        const k1Mesh = new THREE.Mesh(k1Geo, jointMaterial);
        k1Mesh.position.set(0, 0, 0);
        fingerRoot.add(k1Mesh);

        // Mid joint
        const midJoint = new THREE.Group();
        midJoint.position.set(0, f.len * 0.45, 0);

        const midGeo = new THREE.CylinderGeometry(f.thick * 0.75, f.thick * 0.9, f.len * 0.35, 16);
        const midMesh = new THREE.Mesh(midGeo, material);
        midMesh.position.set(0, (f.len * 0.35) / 2, 0);
        midJoint.add(midMesh);

        // Knuckle 2
        const k2Geo = new THREE.SphereGeometry(f.thick * 0.85, 16, 16);
        const k2Mesh = new THREE.Mesh(k2Geo, jointMaterial);
        midJoint.add(k2Mesh);

        // Distal Phalanx (Fingertip)
        const tipJoint = new THREE.Group();
        tipJoint.position.set(0, f.len * 0.35, 0);

        const tipGeo = new THREE.CylinderGeometry(f.thick * 0.5, f.thick * 0.75, f.len * 0.28, 16);
        const tipMesh = new THREE.Mesh(tipGeo, material);
        tipMesh.position.set(0, (f.len * 0.28) / 2, 0);
        tipJoint.add(tipMesh);

        const tipCapGeo = new THREE.SphereGeometry(f.thick * 0.55, 16, 16);
        const tipCap = new THREE.Mesh(tipCapGeo, jointMaterial);
        tipCap.position.set(0, f.len * 0.28, 0);
        tipJoint.add(tipCap);

        midJoint.add(tipJoint);
        fingerRoot.add(midJoint);
        handGroup.add(fingerRoot);

        fingerGroups.push(fingerRoot);
      });

      // Thumb
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(-0.75 * sign, 0.4, 0.15);
      thumbRoot.rotation.z = 0.65 * sign;
      thumbRoot.rotation.y = 0.4 * sign;

      const thumbProxGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.6, 16);
      const thumbProxMesh = new THREE.Mesh(thumbProxGeo, material);
      thumbProxMesh.position.set(0, 0.3, 0);
      thumbRoot.add(thumbProxMesh);

      const thumbDistal = new THREE.Group();
      thumbDistal.position.set(0, 0.6, 0);

      const thumbDistalGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.5, 16);
      const thumbDistalMesh = new THREE.Mesh(thumbDistalGeo, material);
      thumbDistalMesh.position.set(0, 0.25, 0);
      thumbDistal.add(thumbDistalMesh);

      const thumbCap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), jointMaterial);
      thumbCap.position.set(0, 0.5, 0);
      thumbDistal.add(thumbCap);

      thumbRoot.add(thumbDistal);
      handGroup.add(thumbRoot);

      return {
        group: handGroup,
        fingers: fingerGroups,
        thumb: thumbRoot,
        thumbDistal,
      };
    }

    const leftHand = createArticulatedHand(true, skinMaterialLender);
    const rightHand = createArticulatedHand(false, skinMaterialBorrower);

    // Initial positioning
    leftHand.group.position.set(-5.2, -0.4, 0);
    leftHand.group.rotation.set(0.2, 0.3, -1.2);

    rightHand.group.position.set(5.2, -0.4, 0);
    rightHand.group.rotation.set(0.2, -0.3, 1.2);

    scene.add(leftHand.group);
    scene.add(rightHand.group);

    // ==========================================
    // HOLOGRAPHIC VERIFICATION SHIELD
    // ==========================================
    const shieldGroup = new THREE.Group();
    const shieldGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldGroup.add(shieldMesh);

    const shieldInnerGeo = new THREE.OctahedronGeometry(0.5, 0);
    const shieldInnerMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const shieldInnerMesh = new THREE.Mesh(shieldInnerGeo, shieldInnerMat);
    shieldGroup.add(shieldInnerMesh);

    scene.add(shieldGroup);

    // ==========================================
    // CAPITAL FLOW & PARTICLES SYSTEM
    // ==========================================
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleSeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
      particleSeeds[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x2dd4bf,
      size: 0.075,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // CAPITAL FLOW BEZIER STREAMS (Handshake phase)
    // ==========================================
    const streamCount = 20;
    const streamGeo = new THREE.BufferGeometry();
    const streamPositions = new Float32Array(streamCount * 30 * 3);
    streamGeo.setAttribute("position", new THREE.BufferAttribute(streamPositions, 3));

    const streamMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const streamLines = new THREE.LineSegments(streamGeo, streamMat);
    scene.add(streamLines);

    // ==========================================
    // P2P NETWORK CONSTELLATION NODES (Stage 7)
    // ==========================================
    const networkGroup = new THREE.Group();
    const nodeCount = 24;
    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.9,
    });

    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.8 + Math.random() * 2.5;
      node.position.set(
        Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * (radius * 0.6) + (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 3
      );
      networkGroup.add(node);
      nodes.push(node);
    }
    networkGroup.visible = false;
    scene.add(networkGroup);

    // ==========================================
    // ANIMATION & SCROLL-DRIVEN NARRATIVE LOOP
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const p = Math.max(0, Math.min(1, progressRef.current));
      const mx = mouseRef.current.x * 0.4;
      const my = mouseRef.current.y * 0.3;

      // Parallax camera lerp
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mx, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -my, 0.05);
      camera.lookAt(0, 0, 0);

      // ----------------------------------------------------
      // STAGE 1 (0.00 - 0.15): Separation
      // ----------------------------------------------------
      // STAGE 2 (0.15 - 0.30): Opportunity
      // STAGE 3 (0.30 - 0.45): Verification
      // STAGE 4 (0.45 - 0.58): Agreement
      // STAGE 5 (0.58 - 0.65): Handshake Moment
      // STAGE 6 (0.65 - 0.80): Capital Flow
      // STAGE 7 (0.80 - 1.00): Network Expansion
      // ----------------------------------------------------

      // Smooth interpolation for Left Hand (Lender)
      const leftTargetX = THREE.MathUtils.lerp(-5.0, -0.62, Math.min(p / 0.58, 1));
      const leftTargetY = THREE.MathUtils.lerp(-0.4, 0.05, Math.min(p / 0.58, 1));
      const leftTargetRotZ = THREE.MathUtils.lerp(-1.2, -0.25, Math.min(p / 0.58, 1));
      const leftTargetRotY = THREE.MathUtils.lerp(0.3, 0.75, Math.min(p / 0.58, 1));

      // Smooth interpolation for Right Hand (Borrower)
      const rightTargetX = THREE.MathUtils.lerp(5.0, 0.62, Math.min(p / 0.58, 1));
      const rightTargetY = THREE.MathUtils.lerp(-0.4, -0.05, Math.min(p / 0.58, 1));
      const rightTargetRotZ = THREE.MathUtils.lerp(1.2, 0.25, Math.min(p / 0.58, 1));
      const rightTargetRotY = THREE.MathUtils.lerp(-0.3, -0.75, Math.min(p / 0.58, 1));

      // Subtle breathing idle motion
      const idleLeftY = Math.sin(time * 1.5) * 0.05;
      const idleRightY = Math.cos(time * 1.5) * 0.05;

      leftHand.group.position.x = leftTargetX;
      leftHand.group.position.y = leftTargetY + idleLeftY;
      leftHand.group.rotation.z = leftTargetRotZ;
      leftHand.group.rotation.y = leftTargetRotY;

      rightHand.group.position.x = rightTargetX;
      rightHand.group.position.y = rightTargetY + idleRightY;
      rightHand.group.rotation.z = rightTargetRotZ;
      rightHand.group.rotation.y = rightTargetRotY;

      // Finger curl & handshake clasping
      let fingerCurl = 0;
      if (p > 0.45 && p <= 0.6) {
        // Hands opening up into handshake ready posture
        fingerCurl = THREE.MathUtils.lerp(0, -0.3, (p - 0.45) / 0.15);
      } else if (p > 0.6) {
        // Firm handshake wrap around each other's palm
        fingerCurl = THREE.MathUtils.lerp(0, 0.95, Math.min((p - 0.6) / 0.1, 1));
      }

      leftHand.fingers.forEach((f, idx) => {
        f.rotation.z = fingerCurl * (0.8 + idx * 0.08);
      });
      rightHand.fingers.forEach((f, idx) => {
        f.rotation.z = -fingerCurl * (0.8 + idx * 0.08);
      });

      // Thumb locking
      const thumbGrasp = p > 0.58 ? Math.min((p - 0.58) / 0.1, 1) * 0.7 : 0;
      leftHand.thumbDistal.rotation.z = thumbGrasp;
      rightHand.thumbDistal.rotation.z = -thumbGrasp;

      // ==========================================
      // STAGE 3: Holographic Verification Shield
      // ==========================================
      if (p >= 0.28 && p <= 0.48) {
        const shieldOpacity =
          p < 0.38
            ? (p - 0.28) / 0.1
            : 1 - (p - 0.38) / 0.1;
        shieldMat.opacity = Math.max(0, Math.min(1, shieldOpacity * 0.85));
        shieldInnerMat.opacity = Math.max(0, Math.min(1, shieldOpacity * 0.6));
        shieldGroup.rotation.y = time * 0.8;
        shieldGroup.rotation.x = time * 0.4;
        shieldGroup.scale.setScalar(0.9 + Math.sin(time * 3) * 0.05);
      } else {
        shieldMat.opacity = 0;
        shieldInnerMat.opacity = 0;
      }

      // ==========================================
      // STAGE 5 & 6: Handshake Climax Light & Bloom
      // ==========================================
      if (p >= 0.58 && p <= 0.75) {
        const pulse = Math.sin((p - 0.58) * Math.PI * 4);
        centerGlow.intensity = Math.max(0, pulse * 5.5);
      } else {
        centerGlow.intensity = 0;
      }

      // ==========================================
      // STAGE 6: Capital Flow Particle Streams
      // ==========================================
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        if (p > 0.6) {
          // Particles flow in a focused luminous channel between hands
          const progressInStream = (time * particleSpeeds[i] * 0.8) % 1;
          const px = THREE.MathUtils.lerp(-1.2, 1.2, progressInStream);
          const py = Math.sin(progressInStream * Math.PI * 3 + particleSeeds[i]) * 0.35;
          const pz = Math.cos(progressInStream * Math.PI * 2 + particleSeeds[i]) * 0.35;

          positions[i * 3 + 0] = px;
          positions[i * 3 + 1] = py;
          positions[i * 3 + 2] = pz;
        } else {
          // Floating ambient dust
          positions[i * 3 + 1] += Math.sin(time + particleSeeds[i]) * 0.003;
        }
      }
      posAttr.needsUpdate = true;

      if (p > 0.6) {
        particleMat.opacity = THREE.MathUtils.lerp(0.3, 0.9, (p - 0.6) / 0.2);
        particleMat.size = 0.09;
      } else {
        particleMat.opacity = 0.25;
        particleMat.size = 0.05;
      }

      // ==========================================
      // STAGE 7: P2P Network Expansion
      // ==========================================
      if (p > 0.78) {
        networkGroup.visible = true;
        const netAlpha = (p - 0.78) / 0.22;
        networkGroup.rotation.y = time * 0.15;
        networkGroup.scale.setScalar(THREE.MathUtils.lerp(0.5, 1.2, netAlpha));
        camera.position.z = THREE.MathUtils.lerp(11, 14.5, netAlpha);
      } else {
        networkGroup.visible = false;
        camera.position.z = 11;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full overflow-hidden"
    />
  );
}