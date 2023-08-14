#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform sampler2D uSampler;

uniform float uTime;
uniform vec2 uCoords;
uniform float uScale;
uniform vec2 uCamera;
uniform float uRange;
uniform float uSonarQuality;
uniform float uSonarRange;

const float PI = 3.14159265358979323846264f;
out vec4 color;

float rand(float n) {
    return fract(sin(n) * 43758.5453123f);
}

float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0f), fc);
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898f, 4.1414f))) * 43758.5453f);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0f - 2.0f * u);

    float res = mix(mix(rand(ip), rand(ip + vec2(1.0f, 0.0f)), u.x), mix(rand(ip + vec2(0.0f, 1.0f)), rand(ip + vec2(1.0f, 1.0f)), u.x), u.y);
    return res * res;
}

float mod289(float x) {
    return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}
vec4 perm(vec4 x) {
    return mod289(((x * 34.0f) + 1.0f) * x);
}

float noise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0f - 2.0f * d);

    vec4 b = a.xxyy + vec4(0.0f, 1.0f, 0.0f, 1.0f);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0f);

    vec4 o1 = fract(k3 * (1.0f / 41.0f));
    vec4 o2 = fract(k4 * (1.0f / 41.0f));

    vec4 o3 = o2 * d.z + o1 * (1.0f - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0f - d.x);

    return o4.y * d.y + o4.x * (1.0f - d.y);
}

void main(void) {
    vec2 mul = (outputFrame.zw * inputSize.zw);
    vec2 properCoord = vTextureCoord;
    vec2 worldCoords = (properCoord * outputFrame.zw - outputFrame.zw * 0.5f) / uScale - uCamera;
    vec2 outputCoord = properCoord * mul;
    vec4 tex = texture(uSampler, outputCoord);
    float currentRange = (uRange - noise(uTime * 10.f - properCoord.y * 30.f) * 10.f);
    float dist = distance(properCoord * outputFrame.zw, uCoords) / uScale;
    float visibility = max(0.75f - min(pow(dist / currentRange, 1.5f), 1.f), 0.f);

    float dotNoise = noise(worldCoords * 0.05f) * noise(worldCoords * 0.055f) * noise(vec3(worldCoords * (0.04f), uTime * 0.3f + properCoord.x));
    float dotValue = pow(dotNoise, 3.f);
    float dotPower = 0.5f;
    vec4 dots = vec4(vec3(0) * (1.f - dotPower) + dotPower * vec3(dotValue), 1);
    dots.rgb *= visibility;
    tex.rgb = visibility * tex.rgb;

    tex.rgb += visibility * 0.1f;

    if(uSonarRange > uRange) {
        vec2 dir = normalize(properCoord - vec2(0.5f));
        float sonarNoise = noise(vec3(worldCoords * 0.1f, uTime * 3.f));
        vec4 sonarA = texture(uSampler, outputCoord + dir * 0.08f * uScale * sonarNoise);
        vec4 sonarB = texture(uSampler, outputCoord + dir * 0.04f * uScale * sonarNoise);
        float sonarPhase = mod(uTime, 1.f) / 1.f;
        float propagation = max(0.f, 1.f - abs((dist / uSonarRange) - sonarPhase));
        propagation = propagation * max(0.0f, pow(propagation * 1.1f, 10.f));
        float sonarLevel = max(sonarA.a - sonarB.a, 0.f) * max(0.f, pow(1.f - dist / uSonarRange, 0.2f));

        vec3 sonar = vec3(0.f, sonarLevel * 0.5f, sonarLevel * propagation);
        tex.rgb += sonar * max(0.f, 1.f - visibility * 2.f) * 0.3f;
    }
    tex.a = 1.f;

    color = tex + dots;
}
